export const GEMINI_MODEL_NAME: string = "Gemini 3.5 Flash";
export const GEMINI_MODEL: string = "gemini-3.5-flash";

export const PLANS = {
  free: {
    label: "Free",
    credits: 10,
    price: 0,
  },
  starter: {
    label: "Starter",
    credits: 50,
    price: 9,
  },
  pro: {
    label: "Pro",
    credits: 150,
    price: 25,
  },
} as const;

export const CREDIT_COST_PER_GENERATION: number = 1;

export const MIN_CREDITS_TO_GENERATE: number = 1;

export const PRICING_PLANS = [
  {
    key: "free",
    label: "Free",
    description: "Start building. No credit card required.",
    price: 0,
    featured: false,
    planId: null,
    active: true,
    features: ["10 generations / month", "Live preview", "Export to zip"],
  },
  {
    key: "starter",
    label: "Starter",
    description: "For developers who build regularly.",
    price: 9,
    featured: true,
    planId: "cplan_3Fyu2xrQSsR3VJhoLg2BpnV5rMH",
    active: false,
    features: [
      "50 generations / month",
      "Live preview",
      "Export to zip",
      "Image uploads",
    ],
  },
  {
    key: "pro",
    label: "Pro",
    description: "For power users who ship fast.",
    price: 25,
    featured: false,
    planId: "cplan_3FyuKtowDS6JHnOCjUG4M5nlK8x",
    active: false,
    features: [
      "150 generations / month",
      "Access to Forge Pro Agent",
      "Priority AI (lower waiting time)",
      "Live preview",
      "Export to zip",
      "Image uploads",
    ],
  },
] as const;

export const PLAN_RANK: Record<string, number> = {
  free: 0,
  starter: 1,
  pro: 2,
} as const;

// Code - Panel Placeholder
export const CODE_PLACEHOLDER = {
  "/main.tsx": {
    code: `
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
`,
  },

  "/App.tsx": {
    code: `
import AppRoutes from "./routes";

export default function App() {
  return (
      <AppRoutes />
  );
}
`,
  },

  "/routes/index.tsx": {
    code: `
import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import NotFoundPage from "../pages/NotFoundPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
`,
  },

  "/pages/HomePage.tsx": {
    code: `
import { Zap } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950">
      <div className="text-center">
        <Zap className="mx-auto mb-6 h-14 w-14 text-orange-500" />

        <h1 className="text-3xl font-bold text-white">
          AI App Builder
        </h1>

        <p className="mt-4 text-zinc-400">
          Describe your idea and your production-ready app will appear here.
        </p>
      </div>
    </main>
  );
}
`,
  },

  "/pages/NotFoundPage.tsx": {
    code: `
export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <h1 className="text-3xl font-semibold">
        404 - Page Not Found
      </h1>
    </div>
  );
}
`,
  },

  "/hooks/useApp.ts": {
    code: `
export function useApp() {
  return {};
}
`,
  },

  "/utils/index.ts": {
    code: `
export {};
`,
  },

  "/types/index.ts": {
    code: `
export {};
`,
  },

  "/.env.sample": {
    code: `
VITE_API_URL=
`,
  },
};

// base dependencies for each workspace
export const BASE_DEPENDENCIES: Record<string, string> = {
  "react-router-dom": "latest",
  "lucide-react": "latest",
  clsx: "latest",
  "tailwind-merge": "latest",
  "class-variance-authority": "latest",
  sonner: "latest",
};

export const SYSTEM_PROMPT = `
You are a Staff Software Engineer and AI Full-Stack Architect.

Generate production-ready React + TypeScript applications.

Return ONLY valid JSON (parsable by JSON.parse()):

{
  "assistantMessage":"string",
  "title":"string",
  "files":{
    "/path/file":{"code":"complete source"}
  },
  "dependencies":{
    "package":"latest"
  }
}

Return no markdown, explanations, or extra text.

The runtime already provides:
- React
- TypeScript
- Vite
- Tailwind CSS
- Sandpack
- package.json
- tsconfig.json
- vite.config.ts
- index.html

Generate only source files under:
/App.tsx
/main.tsx
/routes/**
/pages/**
/layouts/**
/features/**
/components/**
/components/ui/**
/hooks/**
/context/**
/services/**
/lib/**
/utils/**
/types/**
/constants/**
/assets/**
/.env.sample

Never generate configs, lockfiles, build folders, README, public assets, or package.json unless requested.

Requirements:
- Complete files only.
- No placeholders, omissions, or partial implementations.
- Replace existing placeholder files completely when needed.
- Every import must resolve.
- No unused files or imports.
- Compile without TypeScript errors.
- Prefer strict typing; avoid any unless unavoidable.
- Use modular, reusable, feature-based architecture.
- Favor composition over large components.
- Generate only the files required for the requested application.

Routing:
- Use React Router only when multiple pages are needed.

Services:
- Centralize API calls in /services.
- Never fabricate backend APIs, credentials, or schemas.
- If backend details are missing, keep the frontend runnable and add concise TODOs only where manual configuration is required.

Environment:
- Generate /.env.sample only if environment variables are used.
- Never hardcode secrets.

Dependencies:
- Include only imported third-party packages.
- Every imported package must appear in dependencies.
- Exclude react, react-dom, and tailwindcss.
- Use "latest" unless a version is requested.

UI:
- Responsive, accessible, modern, and production-quality.

assistantMessage must be one concise sentence.
title must be 2–6 words.

Optimize so the developer only needs to:
1. Install dependencies.
2. Fill any required environment variables.
3. Run the application.
`;
