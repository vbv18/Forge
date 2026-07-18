import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { prisma } from "@/lib/prisma";
import {
  CREDIT_COST_PER_GENERATION,
  GEMINI_MODEL,
  SYSTEM_PROMPT,
} from "@/lib/constants";
import type { Message, FileData } from "@/types/workspace";
import { aj } from "@/lib/arcjet";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

function trimHistory(messages: Message[]): Message[] {
  if (messages.length <= 10) return messages;
  return [messages[0], ...messages.slice(-8)];
}

function buildContents(messages: Message[], fileData: FileData | null) {
  const trimmed = trimHistory(messages);

  return trimmed.map((msg, idx) => {
    const role = msg.role === "assistant" ? "model" : "user";

    if (msg.role === "user") {
      const parts: object[] = [];

      let text = msg.content;

      if (msg.imageUrl) {
        text = `[The user has attached an image. Use this URL directly in the generated app where relevant (as img src, background-image, etc.): ${msg.imageUrl}]\n\n${text}`;
      }

      const isLast = idx === trimmed.length - 1;
      if (isLast && fileData) {
        text +=
          "\n\nCurrent project files for context:\n" +
          JSON.stringify(fileData, null, 2);
      }

      parts.push({ text });
      return { role, parts };
    }

    return { role, parts: [{ text: msg.content }] };
  });
}

function sseEvent(type: string, payload: unknown): string {
  return `data: ${JSON.stringify({ type, ...(payload as object) })}\n\n`;
}

function extractThoughLabel(text: string): string | null {
  // grab headings from thoughts
  const boldMatch = text.match(/\*\*([^*]{4,60})\*\*/);
  if (boldMatch) return boldMatch[1].trim();

  // fall back to first sentence
  const sentence = text.split(/[.\n]/)[0].trim();
  if (sentence.length >= 8 && sentence.length <= 80) return sentence;

  return null;
}

async function validateDependencies(
  deps: Record<string, string>,
): Promise<Record<string, string>> {
  const valid: Record<string, string> = {};

  await Promise.all(
    Object.entries(deps).map(async ([pkg, version]) => {
      try {
        const res = await fetch(`https://registry.npmjs.org/${pkg}/latest`, {
          signal: AbortSignal.timeout(1500),
        });

        if (res.ok) valid[pkg] = version;
      } catch {
        // silent
      }
    }),
  );

  return valid;
}

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();

  if (!clerkId)
    return NextResponse.json(
      {
        message: "Unauthorized",
      },
      {
        status: 401,
      },
    );

  const body = await req.json();

  const { workspaceId, messages, fileData } = body as {
    workspaceId: string | null;
    userId: string;
    messages: Message[];
    fileData: FileData | null;
  };

  if (!messages?.length) {
    return Response.json({ message: "No messages provided" }, { status: 400 });
  }

  // Arcjet : rate limit, prompt injection, sensitive info
  const ajReq = new NextRequest(req.url, {
    method: req.method,
    headers: req.headers,
    body: JSON.stringify(body),
  });

  const lastUserMessage =
    [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

  let decision;

  try {
    decision = await aj.protect(ajReq, {
      requested: 1,
      userId: clerkId,
      detectPromptInjectionMessage: lastUserMessage,
    });

    if (decision.isDenied()) {
      return NextResponse.json(
        {
          messages: decision.reason?.type ?? "Request Blocked",
        },
        {
          status: 429,
        },
      );
    }
  } catch (err) {
    console.warn("Archet unavailable");
  }

  const user = await prisma.user.findUnique({
    where: {
      clerkId,
    },
    select: {
      id: true,
      credits: true,
    },
  });

  if (!user) {
    return NextResponse.json(
      {
        message: "User not found",
      },
      {
        status: 404,
      },
    );
  }

  if (user.credits < CREDIT_COST_PER_GENERATION) {
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

      try {
        const contents = buildContents(messages, fileData);

        const geministream = await ai.models.generateContentStream({
          model: GEMINI_MODEL,
          contents,
          config: {
            systemInstruction: SYSTEM_PROMPT,
            temperature: 0.6,
            responseMimeType: "application/json",
            thinkingConfig: {
              // LLMs emit thought chunks before the actual output.
              // We will extract them and emit as status events.
              includeThoughts: true,
            },
          },
        });

        let accumulated = ""; // collects the actual json output chunks
        let lastEmitTime = 0; // used to throttle thought to status emissions

        for await (const chunk of geministream) {
          const parts = chunk.candidates?.[0]?.content?.parts ?? [];

          for (const part of parts) {
            if (!part.text) continue;

            if (part.thought) {
              const now = Date.now();
              if (now - lastEmitTime > 600) {
                const label = extractThoughLabel(part.text);
                if (label) {
                  enqueue(sseEvent("status", { message: label }));
                  lastEmitTime = now;
                }
              }
            } else {
              accumulated += part.text;
            }
          }
        }

        // parse the response
        let parsed: {
          assistantMessage: string;
          title?: string;
          files: Record<string, { code: string }>;
          dependencies: Record<string, string>;
        };

        try {
          parsed = JSON.parse(accumulated);
        } catch (err) {
          enqueue(
            sseEvent("error", {
              message: "AI returned invalid JSON.Please try again.",
            }),
          );

          controller.close();
          return;
        }

        const {
          assistantMessage,
          title: aiTitle,
          files,
          dependencies,
        } = parsed;

        if (!files || typeof files !== "object") {
          enqueue(
            sseEvent("error", {
              message: "AI response missing files. Please try again.",
            }),
          );

          controller.close();
          return;
        }

        // validate packages
        enqueue(
          sseEvent("status", {
            message: "Validating Packages...",
          }),
        );

        const validatedDeps = await validateDependencies(dependencies ?? {});

        const newFileData: FileData = {
          files,
          dependencies: validatedDeps,
          title: aiTitle,
        };

        // upsert workspace, deduct credit

        enqueue(
          sseEvent("status", {
            message: "Saving...",
          }),
        );

        const lastUserMessage = messages[messages.length - 1];
        const updatedMessages: Message[] = [
          ...messages,
          { role: "assistant", content: assistantMessage },
        ];

        const workspace = await prisma.$transaction(async (tx) => {
          const ws = workspaceId
            ? await tx.workspace.update({
                where: {
                  id: workspaceId,
                  userId: user.id,
                },
                data: {
                  messages: updatedMessages as never,
                  fileData: newFileData as never,
                },
              })
            : await tx.workspace.create({
                data: {
                  userId: user.id,
                  title: aiTitle ?? lastUserMessage.content.slice(0, 80),
                  fileData: newFileData as never,
                  messages: updatedMessages as never,
                },
              });

          await tx.user.update({
            where: {
              id: user.id,
            },
            data: {
              credits: {
                decrement: CREDIT_COST_PER_GENERATION,
              },
            },
          });

          return ws;
        });

        const updatedUser = await prisma.user.findUnique({
          where: {
            id: user.id,
          },
          select: {
            credits: true,
          },
        });

        // emit final result
        enqueue(
          sseEvent("done", {
            workspaceId: workspace.id,
            assistantMessage,
            fileData: newFileData,
            creditsRemaining:
              updatedUser?.credits ?? user.credits - CREDIT_COST_PER_GENERATION,
          }),
        );
      } catch (err) {
        console.error("[gen-ai] stream error:", err);
        enqueue(
          sseEvent("error", {
            message: "Something went wrong. Please try again.",
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
export const maxDuration = 300; // Vercel fluid
