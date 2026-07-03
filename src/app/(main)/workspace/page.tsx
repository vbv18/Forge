import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";

type WorkspacePageProps = {
  searchParams: Promise<{
    prompt?: string;
    id?: string;
  }>;
};

export default async function WorkspacePage({
  searchParams,
}: WorkspacePageProps) {
  const { prompt, id } = await searchParams;

  const { userId } = await auth();
  if (!userId) redirect("/");

  return (
    <div>
      <p>
        Workspace - prompt:{prompt}, id:{id}
      </p>
    </div>
  );
}
