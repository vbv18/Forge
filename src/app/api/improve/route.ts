import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { FileData, Files } from "@/types/workspace";
import { prisma } from "@/lib/prisma";
import {
  AgentSystemPrompt,
  CREDIT_COST_PER_GENERATION,
  GEMINI_MODEL,
} from "@/lib/constants";
import { google } from "@ai-sdk/google";
import { streamText, tool, stepCountIs } from "ai";
import { z } from "zod";

function sseEvent(type: string, payload: object): string {
  return `data: ${JSON.stringify({ type, ...payload })}\n\n`;
}

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { fileData, userRequest, workspaceId } = body as {
    fileData: FileData;
    userRequest: string;
    workspaceId: string;
  };

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true, credits: true, plan: true },
  });

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 400 });
  }
  if (user.plan !== "pro") {
    return NextResponse.json({ message: "Upgrade required" }, { status: 403 });
  }
  if (user.credits < CREDIT_COST_PER_GENERATION) {
    return NextResponse.json(
      { message: "Insufficient credits" },
      { status: 402 },
    );
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const enqueue = (chunk: string) =>
        controller.enqueue(encoder.encode(chunk));

      const patchedFiles: Files = { ...fileData.files };
      let finalSummary = "";

      const updateFileTool = tool({
        description:
          "Update or rewrite a file in the React sandbox. Call once per file you need to change.",
        inputSchema: z.object({
          path: z
            .string()
            .describe("File path exactly as it appears, e.g. /App.jsx"),
          code: z.string().describe("Complete new contents of the file"),
          reason: z
            .string()
            .describe("One sentence explaining what you changed and why"),
        }),
        execute: async ({ path, code, reason }) => {
          patchedFiles[path] = { code };
          enqueue(sseEvent("file_patch", { path, code, reason }));
          enqueue(
            sseEvent("thinking", { text: `\n\nUpdating \`${path}\`...` }),
          );
          return { success: true };
        },
      });

      const doneImprovingTool = tool({
        description:
          "Call this when you have finished making all improvements.",
        inputSchema: z.object({
          summary: z
            .string()
            .describe(
              "A short friendly summary of all the improvements you made (1-3 sentences)",
            ),
        }),
        execute: async ({ summary }) => {
          finalSummary = summary;
          enqueue(
            sseEvent("thinking", { text: "\n\nFinalizing improvements..." }),
          );
          return { done: true };
        },
      });

      const tools = {
        update_file: updateFileTool,
        done_improving: doneImprovingTool,
      };

      const fileContext = Object.entries(fileData.files)
        .map(([path, { code }]) => `// ${path}\n${code}`)
        .join("\n\n---\n\n");

      try {
        enqueue(sseEvent("status", { message: "Agent starting…" }));

        const result = streamText({
          model: google(GEMINI_MODEL),
          system: AgentSystemPrompt(fileContext),
          prompt: userRequest,
          stopWhen: stepCountIs(8),
          tools,
        });

        // Stream text-delta chunks to chat panel as "thinking" events.
        for await (const part of result.fullStream) {
          switch (part.type) {
            case "text-delta":
              if (part.text) {
                enqueue(sseEvent("thinking", { text: part.text }));
              }
              break;
            case "error":
              throw part.error instanceof Error
                ? part.error
                : new Error(String(part.error));
            default:
              break;
          }
        }

        // Ensure generation fully finished (throws on failure).
        const finishReason = await result.finishReason;
        if (finishReason === "error") {
          throw new Error("Agent run failed");
        }

        const newFileData: FileData = {
          files: patchedFiles,
          dependencies: fileData.dependencies,
          title: fileData.title,
        };

        await prisma.$transaction([
          prisma.workspace.update({
            where: { id: workspaceId, userId: user.id },
            data: { fileData: newFileData as never },
          }),
          prisma.user.update({
            where: { id: user.id },
            data: { credits: { decrement: CREDIT_COST_PER_GENERATION } },
          }),
        ]);

        const updatedUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { credits: true },
        });

        const outputText = await result.text;

        enqueue(
          sseEvent("done", {
            fileData: newFileData,
            summary: finalSummary || outputText,
            creditsRemaining:
              updatedUser?.credits ?? user.credits - CREDIT_COST_PER_GENERATION,
          }),
        );
      } catch (err) {
        console.error("[improve] error:", err);
        enqueue(
          sseEvent("error", {
            message:
              err instanceof Error ? err.message : "Something went wrong.",
          }),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

export const runtime = "nodejs";
export const maxDuration = 300;
