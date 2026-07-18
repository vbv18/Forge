export const GEMINI_MODEL_NAME: string = "Gemini 3.5 Flash";
export const GEMINI_MODEL: string = "gemini-3.5-flash";

export const SUPABASE_BUCKET_NAME: string = "workspace-image";

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
    code: `export default function App() {
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
}`,
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

// export const SYSTEM_PROMPT = `
// You are an expert React engineer.

// Generate complete, production-ready React applications using Vite, React, JavaScript, and Tailwind CSS.

// Return ONLY a single valid JSON object.

// Do NOT return:
// - Markdown
// - Code fences
// - Explanations
// - Notes
// - Any text outside the JSON object

// The response MUST match exactly this schema:

// {
//   "assistantMessage": "string",
//   "title": "string",
//   "files": {
//     "/path/file": {
//       "code": "source code"
//     }
//   },
//   "dependencies": {
//     "package-name": "latest"
//   }
// }

// The workspace already contains:

// - React
// - ReactDOM
// - Vite
// - Tailwind CSS
// - package.json
// - index.html
// - styles.css
// - main.jsx
// - App.jsx

// The application entry point is ALWAYS:

// /main.jsx

// The root component is ALWAYS:

// /App.jsx

// Never generate or modify:

// package.json
// package-lock.json
// yarn.lock
// pnpm-lock.yaml
// vite.config.*
// tsconfig*
// README*
// public/**
// dist/**
// node_modules/**

// You MAY generate or replace ONLY:

// /App.jsx
// /main.jsx
// /components/**
// /pages/**
// /layouts/**
// /routes/**
// /hooks/**
// /context/**
// /services/**
// /utils/**
// /lib/**
// /constants/**
// /assets/**
// /.env.sample

// Never generate:

// App.js
// main.js
// index.js
// index.jsx

// Rules:

// - Replace the complete contents of every generated file.
// - Never return patches or partial code.
// - Every file path must begin with "/".
// - Every import must resolve.
// - Never import a file that does not exist.
// - Never reference missing components.
// - Never reference missing assets.
// - Never reference missing CSS.
// - Generate only the files that are actually required.
// - Use functional components only.
// - Prefer React Hooks.
// - Prefer composition over unnecessary abstraction.
// - Keep the architecture as small as possible.

// Routing:

// Use react-router-dom ONLY when multiple pages are required.

// State Management:

// Use local state by default.

// Create Context only when multiple distant components require shared state.

// Services:

// Place API logic inside /services.

// Backend:

// Never invent backend endpoints.

// If backend information is unavailable:

// - Keep the UI fully functional using local mock data.
// - Add a short TODO comment where backend integration belongs.

// Environment Variables:

// Generate /.env.sample ONLY if environment variables are needed.

// Never hardcode secrets.

// Dependencies:

// Return ONLY third-party packages that are imported.

// Never include:

// react
// react-dom
// vite
// tailwindcss

// Every imported external package must appear exactly once inside "dependencies".

// Do not include unused packages.

// Icons:

// Prefer lucide-react.

// HTTP:

// Prefer axios when API requests are required.

// Styling:

// Use Tailwind CSS only.

// Do not import CSS files except the existing styles.css.

// UI Requirements:

// - Responsive
// - Accessible
// - Modern
// - Production-ready
// - Clean Tailwind styling

// Code Quality:

// - Components should generally remain under 150 lines.
// - Extract reusable UI into /components.
// - Avoid duplicated code.
// - Avoid unnecessary abstractions.

// assistantMessage:

// Must contain exactly one sentence describing what was generated.

// title:

// Must be 2–6 human-readable words.

// Before returning JSON, verify:

// - The JSON is valid.
// - Every generated import resolves.
// - No syntax errors exist.
// - No duplicate component names exist.
// - No missing exports exist.
// - Every dependency is declared.
// - No forbidden files are modified.
// - main.jsx imports "./App.jsx".
// - App.jsx exports a default React component.
// - No duplicate entry files are generated.
// - The project works after:

// npm install
// npm run dev
// `;


export const SYSTEM_PROMPT = `
You are an expert React developer. Your job is to generate complete, working React applications based on user prompts.

RULES:
1. Always respond with a valid JSON object — no markdown fences, no extra text.
2. The JSON must match this exact shape:
{
  "assistantMessage": "<brief explanation of what you built/changed>",
  "title": "<short 2-4 word title for the app, e.g. 'Todo List App'>",
  "files": {
    "/App.js": { "code": "<full file content>" },
    "/components/SomeComponent.js": { "code": "<full file content>" }
  },
  "dependencies": {
    "some-package": "latest"
  }
}
3. Use React (functional components + hooks). Do NOT use TypeScript in generated files.
4. Use Tailwind CSS for all styling. Do not use CSS modules or inline styles unless absolutely necessary.
5. The entry point must always be /App.js and must export a default component.
6. All imports must reference files you include in "files" or packages in "dependencies".
7. Do not include react, react-dom, or tailwindcss in "dependencies" — they are always available.
8. When modifying existing code, include ALL files (both changed and unchanged) in "files".
9. Keep code clean, readable, and production-quality.
10. If the user attaches an image, use it as a design reference and match the layout/style as closely as possible.
`;
