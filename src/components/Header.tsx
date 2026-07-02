import { ArrowRight, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default async function Header() {
  return (
    <header className="w-full fixed top-0 left-0 z-50 h-16 border-b border-white/6 bg-white/7 backdrop-blur-md">
      <nav className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/">
          <Image
            src={"/logo-1.png"}
            alt="Forge Logo"
            width={100}
            height={100}
            className="h-9 w-auto rounded-md"
            priority
          />
        </Link>

        <div className="flex items-center gap-5">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <Button
                variant="ghost"
                size="sm"
                className="text-[13px] font-medium text-white/50 hover:text-white/90 hover:bg-transparent"
              >
                Sign in
              </Button>
            </SignInButton>

            <SignUpButton mode="modal">
              <Button
                size="sm"
                className="inline-flex h-8 items-center gap-1.5 rounded-full bg-white px-4 text-[13px] font-semibold text-black hover:bg-white/90 active:scale-95"
              >
                Get Started
                <ArrowRight className="h-3 w-3 opacity-60" />
              </Button>
            </SignUpButton>
          </Show>

          <Show when="signed-in">
            <Link
              href={"/projects"}
              className="text-[13px] font-medium text-white/40 transition-colors hover:text-white/80"
            >
              Projects
            </Link>

            <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 text-xs text-white/70">
              <Zap className="h-3 w-3 fill-white/70" />X credits
            </span>

            <UserButton />
          </Show>
        </div>
      </nav>
    </header>
  );
}

// Show from Clerk is designed to run on the server
// but when Header is nested under ThemeProvider (a client component),
// Header is treated as client component.
// By making Header an async function, now it is ambiguously a server component
// because client components cannot be async
