"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { ProjectSummary } from "@/types/project";

export async function getUserProjects(): Promise<ProjectSummary[]> {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/");

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });
  if (!user) redirect("/");

  const workspaces = await prisma.workspace.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      title: true,
      createdAt: true,
      updatedAt: true,
      messages: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return workspaces.map((w) => {
    const msgs = Array.isArray(w.messages) ? w.messages : [];
    const firstUserMsg = msgs.find(
      (m): m is { role: string; content: string } =>
        typeof m === "object" &&
        m !== null &&
        (m as Record<string, unknown>).role === "user",
    );

    return {
      id: w.id,
      title: w.title,
      firstPrompt: firstUserMsg?.content?.slice(0, 120) ?? null, // ← new
      createdAt: w.createdAt,
      updatedAt: w.updatedAt,
      messageCount: Array.isArray(w.messages) ? w.messages.length : 0,
    };
  });
}

export async function deleteProject(workspaceId: string): Promise<void> {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/");

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });
  if (!user) redirect("/");

  await prisma.workspace.deleteMany({
    where: { id: workspaceId, userId: user.id },
  });

  revalidatePath("/projects");
}
