"use client";

import { useEffect, useRef, useState } from "react";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackFileExplorer,
  useSandpack,
} from "@codesandbox/sandpack-react";
import { sandpackDark } from "@codesandbox/sandpack-themes";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { FileData, Files, StatusStep } from "@/types/workspace";
import { BASE_DEPENDENCIES, CODE_PLACEHOLDER } from "@/lib/constants";
import { AlertTriangle, Bot, Code2, Eye } from "lucide-react";
import { RingLoader } from "react-spinners";
import { Button } from "./ui/button";

type ActiveTab = "preview" | "code";

type CodePanelProps = {
  fileData: FileData | null;
  isGenerating: boolean;
  statusLog: StatusStep[];
  onImprove: (userRequest: string) => Promise<void>;
  onFixError: (error: string) => Promise<void>;
  onFilePatch: (patches: FileData) => void;
  appTitle: string | null;
  isImproving: boolean;
  isProUser: boolean;
};

type InnerProps = {
  fileData: FileData | null;
  isGenerating: boolean;
  statusLog: StatusStep[];
  activeTab: ActiveTab;
  setActiveTab: (t: ActiveTab) => void;
  onImprove: (userRequest: string) => Promise<void>;
  onFixError: (error: string) => Promise<void>;
  appTitle: string | null;
  isImproving: boolean;
  isProUser: boolean;
};

function SandpackInner({
  fileData,
  isGenerating,
  statusLog,
  activeTab,
  setActiveTab,
  onImprove,
  onFixError,
  appTitle,
  isImproving,
  isProUser,
}: InnerProps) {
  const { sandpack, listen } = useSandpack();
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [improveInput, setImproveInput] = useState("");
  const [showImproveInput, setShowImproveInput] = useState(false);

  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Push file content updates into Sandpack without remounting.
  const prevFilesRef = useRef<Files>({});

  const currentStepLabel =
    statusLog[statusLog.length - 1]?.label ?? "Generating...";

  useEffect(() => {
    if (!fileData?.files) return;
    const prev = prevFilesRef.current;
    for (const [path, { code }] of Object.entries(fileData.files)) {
      if (prev[path]?.code !== code) {
        sandpack.updateFile(path, code);
      }
    }

    prevFilesRef.current = fileData.files;
  }, [fileData?.files, sandpack]);

  // listen for sandpack runtime errors
  useEffect(() => {
    unsubscribeRef.current = listen((msg) => {
      if (
        msg.type === "action" &&
        "action" in msg &&
        msg.action === "show-error"
      ) {
        const errMsg =
          "message" in msg && typeof msg.message === "string"
            ? msg.message
            : "An error occured in the preview.";

        setPreviewError(errMsg);
        return;
      }

      if (msg.type === "compile") {
        const errMsg =
          "message" in msg && typeof msg.message === "string"
            ? msg.message
            : "Compile error in preview.";

        setPreviewError(errMsg);
        return;
      }

      if (msg.type === "success") {
        setPreviewError(null);
      }
    });

    return () => unsubscribeRef.current?.();
  }, [listen]);

  useEffect(() => {
    if (isGenerating) setPreviewError(null);
  }, [isGenerating]);

  async function handleImproveSubmit() {
    const trimmed = improveInput.trim();
    if (!trimmed || isImproving) return;
    setImproveInput("");
    setShowImproveInput(false);
    await onImprove(trimmed);
  }

  // Todo: Export to ZIP
  async function handleExportZip() {}

  return (
    <Tabs
      value={activeTab}
      onValueChange={(v: ActiveTab) => setActiveTab(v)}
      className={"flex h-full flex-col gap-0"}
    >
      {/* Action bar */}
      <div className="flex items-center justify-between border-b border-white/6 px-2">
        <TabsList
          variant="line"
          className="h-auto gap-0 rounded-none bg-transparent p-0"
        >
          <TabsTrigger className="border-b-2 pt-2" value="code">
            <Code2 className="h-3.5 w-3.5" />
            Code
          </TabsTrigger>
          <TabsTrigger className="border-b-2 pt-2" value="preview">
            <Eye className="h-3.5 w-3.5" />
            Preview
          </TabsTrigger>
        </TabsList>

        <div className="flex items-center gap-2">
          {/* Todo: improve with ai button */}
          {isProUser ? <p>yes</p> : <p>no</p>}

          {/* Todo: export to zip button */}
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden h-full">
        {/* loading overloay */}
        {(isGenerating || isImproving) && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6 bg-[#0a0a0a]/85 backdrop-blur-sm">
            <RingLoader color="#60a5fa" size={64} speedMultiplier={0.8} />
            <div className="flex flex-col items-center gap-1.5">
              <p className="text-sm font-medium text-white/60">
                {isImproving ? "Improving with Cline AI…" : currentStepLabel}
              </p>
              <p className="text-xs text-white/20">
                This usually takes 10–20 seconds
              </p>
            </div>
          </div>
        )}

        <SandpackLayout
          style={{
            height: "100vh",
            border: "none",
            borderRadius: 0,
            background: "transparent",
          }}
        >
          <div
            className={
              activeTab === "preview" ? "flex h-full w-full" : "hidden"
            }
          >
            <SandpackPreview
              style={{ flex: 1 }}
              showOpenInCodeSandbox={false}
            />
          </div>

          <div
            className={activeTab === "code" ? "flex h-full w-full" : "hidden"}
          >
            <SandpackFileExplorer
              style={{
                width: "220px",
                borderRight: "0.5px solid rgba(255,255,255,0.08)",
              }}
            />
            <SandpackCodeEditor
              style={{ flex: 1 }}
              showTabs
              showLineNumbers
              showInlineErrors
              closableTabs
            />
          </div>
        </SandpackLayout>
      </div>

      {/* Error banner */}
      {previewError &&
        !isGenerating &&
        !isImproving &&
        activeTab === "preview" && (
          <div className="absolute inset-x-0 -bottom-3 z-20 border-t border-red-500/20 bg-red-950/99 p-4 pb-6">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400/70" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-red-400/80">
                  Preview error
                </p>
                <p className="break-all text-[11px] text-red-300/50">
                  {previewError}
                </p>
              </div>
              <Button
                onClick={() => onFixError(previewError)}
                variant="destructive"
              >
                <Bot className="h-3 w-3" />
                Fix with AI
              </Button>
            </div>
          </div>
        )}
    </Tabs>
  );
}

export function CodePanel({
  fileData,
  isGenerating,
  statusLog,
  onImprove,
  onFixError,
  onFilePatch: _onFilePatch,
  appTitle,
  isImproving,
  isProUser,
}: CodePanelProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("preview");

  const files = fileData?.files ?? CODE_PLACEHOLDER;

  const dependencies = {
    ...BASE_DEPENDENCIES,
    ...(fileData?.dependencies ?? {}),
  };

  const filePathKey = Object.keys(files).sort().join("|");

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <SandpackProvider
        key={filePathKey}
        template="react-ts"
        theme={sandpackDark}
        files={files}
        customSetup={{ dependencies }}
        options={{
          externalResources: [
            "https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4",
          ],
          recompileMode: "delayed",
          recompileDelay: 500,
        }}
      >
        <SandpackInner
          fileData={fileData}
          isGenerating={isGenerating}
          statusLog={statusLog}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onImprove={onImprove}
          onFixError={onFixError}
          appTitle={appTitle}
          isImproving={isImproving}
          isProUser={isProUser}
        />
      </SandpackProvider>
    </div>
  );
}
