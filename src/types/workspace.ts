export type MessageRole = "user" | "assistant";

export type Files = Record<string, { code: string }>;

export type Message = {
  role: MessageRole;
  content: string;
  imageUrl?: string;
};

export type FileData = {
  files: Files;
  dependencies: Record<string, string>;
  title?: string;
};

export type StatusStep = {
  label: string;
  status: "running" | "done";
};

export type WorkspaceData = {
  id: string;
  title: string | null;
  messages: unknown;
  fileData: unknown;
};

export type WorkspaceUser = {
  id: string;
  credits: number;
  plan: string;
};
