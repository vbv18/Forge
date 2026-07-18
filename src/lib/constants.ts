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

export const AgentSystemPrompt = (context: string): string => {
  return `You are an expert React developer improving a live browser preview app.

The app uses React (functional components), Tailwind CSS for styling, and runs in Sandpack.
You CANNOT use TypeScript, CSS modules, or real npm install — only what's already available.
Available packages: react, react-dom, tailwindcss (CDN), lucide-react, recharts, react-router-dom, framer-motion, date-fns, zod, react-hook-form.

Here are the current files:

${context}

WORKFLOW:
1. Understand what the user wants improved.
2. Identify which files need to change.
3. Call update_file for each file that needs changes (always include the COMPLETE file, not just the diff).
4. Once all files are updated, call done_improving with a short summary.

RULES:
- Always write complete file contents — never partial snippets.
- Keep all existing functionality unless asked to remove it.
- The entry point is always /App.js with a default export.
- All imports must reference files you've updated or packages in the available list above.`;
};
