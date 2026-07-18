import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { FileData, Files } from "@/types/workspace";
import { prisma } from "@/lib/prisma";
import {
  AgentSystemPrompt,
  CREDIT_COST_PER_GENERATION,
  GEMINI_MODEL,
} from "@/lib/constants";
import { Agent, createTool } from "@cline/sdk";
import { z } from "zod";

function sseEvent(type: string, payload: object): string {
  return `data: ${JSON.stringify({
    type,
    ...payload,
  })}\n\n`;
}

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return NextResponse.json(
      {
        message: "Unauthorized",
      },
      {
        status: 401,
      },
    );
  }

  const body = await req.json();

  const { fileData, userRequest, workspaceId } = body as {
    fileData: FileData;
    userRequest: string;
    workspaceId: string;
  };

  const user = await prisma.user.findUnique({
    where: {
      clerkId,
    },
    select: {
      id: true,
      credits: true,
      plan: true,
    },
  });

  if (!user) {
    return NextResponse.json(
      {
        message: "User not found",
      },
      {
        status: 400,
      },
    );
  }

  if (user.plan !== "pro") {
    return NextResponse.json(
      {
        message: "Upgrade required",
      },
      {
        status: 403,
      },
    );
  }

  if (user.credits !== CREDIT_COST_PER_GENERATION) {
    return NextResponse.json(
      {
        message: "Insufficient credits",
      },
      {
        status: 402,
      },
    );
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const enqueue = (chunk: string) =>
        controller.enqueue(encoder.encode(chunk));

      // Accumulate file patches as the agent calls update_file
      const patchedFiles: Files = {
        ...fileData.files,
      };

      let finalSummary = "";

      // ── Tool 1: update_file ──────────────────────────────────────────────
      // The agent calls this once per file it wants to change.
      // We immediately emit a file_patch SSE event so Sandpack
      // updates live in the browser as each file is patched.
      const updateFileTool = createTool({
        name: "update_file",
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
        async execute({ path, code, reason }) {
          patchedFiles[path] = { code };
          // Emit live patch — client applies it to Sandpack immediately
          enqueue(sseEvent("file_patch", { path, code, reason }));
          return `Updated ${path}: ${reason}`;
        },
      });

      // ── Tool 2: done_improving ───────────────────────────────────────────
      // Agent calls this when all files are updated.
      // lifecycle.completesRun: true tells the Cline SDK loop to stop
      // immediately after this tool runs instead of continuing iterations.
      const doneImprovingTool = createTool({
        name: "done_improving",
        description:
          "Call this when you have finished making all improvements.",
        inputSchema: z.object({
          summary: z
            .string()
            .describe(
              "A short friendly summary of all the improvements you made (1-3 sentences)",
            ),
        }),
        lifecycle: {
          completesRun: true,
        },
        async execute({ summary }) {
          finalSummary = summary;
          return "Done.";
        },
      });

      // ── Serialize current files for context ──────────────────────────────
      // We give the agent all current files as context in the system prompt
      // so it knows exactly what it's working with.
      const fileContext = Object.entries(fileData.files)
        .map(([path, { code }]) => `// ${path}\n${code}`)
        .join("\n\n---\n\n");

      const agent = new Agent({
        providerId: "gemini",
        modelId: GEMINI_MODEL,
        apiKey: process.env.GEMINI_API_KEY!,
        maxIterations: 8,
        systemPrompt: AgentSystemPrompt(fileContext),
        tools: [updateFileTool, doneImprovingTool],
        toolPolicies: {
          update_file: { autoApprove: true },
          done_improving: { autoApprove: true },
        },
      });

      try {
        // ── Stream agent reasoning to chat panel ─────────────────────────
        // assistant-text-delta fires as the agent types its reasoning.
        // We emit these as "thinking" events — shown in the chat panel
        // as a live streaming message so users see the agent working.
        agent.subscribe((event) => {
          if (event.type === "assistant-text-delta" && event.text) {
            enqueue(sseEvent("thinking", { text: event.text }));
          }

          // This fires reliably every time a tool is called
          if (event.type === "tool-started") {
            const name = event.toolCall?.toolName;

            if (name === "update_file") {
              const path =
                (event.toolCall?.input as { path?: string })?.path ?? "a file";
              enqueue(
                sseEvent("thinking", { text: `\n\nUpdating \`${path}\`...` }),
              );
            } else if (name === "done_improving") {
              enqueue(
                sseEvent("thinking", {
                  text: "\n\nFinalizing improvements...",
                }),
              );
            }
          }
        });

        // ── Run the agent ─────────────────────────────────────────────────
        enqueue(sseEvent("status", { message: "Cline agent starting…" }));

        const result = await agent.run(userRequest);

        if (result.status === "failed") {
          throw new Error(result.error?.message ?? "Agent run failed");
        }

        // ── Deduct credit + save to DB ────────────────────────────────────

        const newFileData: FileData = {
          files: patchedFiles,
          dependencies: fileData.dependencies,
          title: fileData.title,
        };

        await prisma.$transaction([
          prisma.workspace.update({
            where: {
              id: workspaceId,
              userId: user.id,
            },
            data: {
              fileData: newFileData as never,
            },
          }),
          prisma.user.update({
            where: {
              id: user.id,
            },
            data: {
              credits: {
                decrement: CREDIT_COST_PER_GENERATION,
              },
            },
          }),
        ]);

        const updatedUser = await prisma.user.findUnique({
          where: {
            id: user.id,
          },
          select: {
            credits: true,
          },
        });

        // ── Final done event ──────────────────────────────────────────────

        enqueue(
          sseEvent("done", {
            fileData: newFileData,
            summary: finalSummary || result.outputText,
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
export const maxDuration = 300; // for vercel - 300s on Fluid
