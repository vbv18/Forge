"use client";

import React from "react";
import { useAuth, PricingTable } from "@clerk/nextjs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BlueTitle } from "./re-usables";

type PricingModalProps = {
  children: React.ReactNode;
  reason?: "credits" | "upgrade";
};

export function PricingModal({
  children,
  reason = "upgrade",
}: PricingModalProps) {
  const { isSignedIn, has } = useAuth();

  const title =
    reason === "credits" ? "You're out of credits" : "Upgrade your plan";
  const description =
    reason === "credits"
      ? "You have used all your credits. Upgrade to keep building."
      : "Choose a plan that fits how much you build";

  const activePlanKey = isSignedIn
    ? has?.({ plan: "pro" })
      ? "pro"
      : has?.({ plan: "starter" })
        ? "starter"
        : "free"
    : null;

  return (
    <Dialog>
      <DialogTrigger className={"cursor-pointer"}>{children}</DialogTrigger>

      <DialogContent className="border-white/8 bg-[#0f0f0f] p-0 text-white sm:max-w-5xl max-h-[90dvh] overflow-y-auto">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="font-serif text-xl tracking-tight text-white/90">
            <BlueTitle className="text-4xl">{title}</BlueTitle>
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="p-4">
          <PricingTable
            checkoutProps={{
              appearance: {
                elements: {
                  drawerRoot: {
                    zIndex: 2000,
                  },
                },
              },
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
