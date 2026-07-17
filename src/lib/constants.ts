export const GEMINI_MODEL_NAME: string = "Gemini 3.5 Flash";
export const GEMINI_MODEL: string = "gemini-2.5-flash";

export const SUPABASE_BUCKET_NAME: string = "workspace_image";

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
  "/App.js": {
    code: `
export default function App() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0a",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "system-ui, sans-serif",
    }}>
      <div style={{ textAlign: "center", color: "rgba(255,255,255,0.3)" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>⚡</div>
        <p style={{ fontSize: 14 }}>Your app will appear here</p>
      </div>
    </div>
  );
}
  `,
  },
};

// base dependencies for each workspace
export const BASE_DEPENDENCIES: Record<string, string> = {
  "react-is": "latest",
  "react-router-dom": "latest",
  "lucide-react": "latest",
  recharts: "latest",
  "date-fns": "latest",
  "framer-motion": "latest",
  "react-hook-form": "latest",
  "@hookform/resolvers": "latest",
  zod: "latest",
  "@radix-ui/react-dialog": "latest",
  "@radix-ui/react-dropdown-menu": "latest",
  "@radix-ui/react-tabs": "latest",
  "@radix-ui/react-tooltip": "latest",
  "@radix-ui/react-accordion": "latest",
  "@radix-ui/react-select": "latest",
  axios: "latest",
  clsx: "latest",
  "class-variance-authority": "latest",
  "tailwind-merge": "latest",
};

export const SYSTEM_PROMPT = `
You are a senior React engineer.

Generate production-ready React (JavaScript) applications.

Return ONLY valid JSON parsable by JSON.parse():

{
  "assistantMessage":"string",
  "title":"string",
  "files":{
    "/path/file":{"code":"source"}
  },
  "dependencies":{
    "package":"latest"
  }
}

No markdown, comments outside code, or extra text.

Runtime already includes:
- React
- Vite
- Tailwind CSS
- Sandpack
- package.json
- vite.config.js
- index.html

Generate only:
- /App.jsx
- /main.jsx
- /routes/**
- /pages/**
- /layouts/**
- /features/**
- /components/**
- /components/ui/**
- /hooks/**
- /context/**
- /services/**
- /lib/**
- /utils/**
- /constants/**
- /assets/**
- /.env.sample

Never generate:
- package.json
- package-lock.json
- yarn.lock
- pnpm-lock.yaml
- tsconfig*
- vite.config.*
- README*
- public/**
- dist/**
- node_modules/**

Rules:
- Complete files only.
- Every import must resolve.
- No unused files or imports.
- Keep the project runnable.
- Use modular, reusable, feature-based architecture.
- Prefer composition over large components.
- Generate only required files.

Routing:
- Use react-router-dom only if multiple pages are needed.

Services:
- Put API logic in /services.
- Never invent backend APIs.
- If backend details are missing, keep the app functional and add brief TODOs where configuration is required.

Environment:
- Generate /.env.sample only when env variables are used.
- Never hardcode secrets.

Dependencies:
- List only imported third-party packages.
- Exclude react, react-dom, vite, and tailwindcss.
- Use "latest" unless a version is specified.

UI:
- Responsive, accessible, modern.

assistantMessage: one concise sentence.
title: 2-6 words.

The developer should only need to:
1. npm install
2. Configure .env (if required)
3. npm run dev
`;
