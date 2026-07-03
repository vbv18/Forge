import { PlanType } from "@/types/plan";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";
import { PLANS } from "./constants";

async function getCurrentPlan(): Promise<PlanType> {
  const { has } = await auth();

  if (has({ plan: "pro" })) return "pro";
  else if (has({ plan: "starter" })) return "starter";
  return "free";
}

export async function checkUser() {
  const user = await currentUser();
  if (!user) return null;

  try {
    const currentPlan = await getCurrentPlan();

    const existing = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (existing) {
      if (existing.plan !== currentPlan) {
        const existingPlanCredits =
          PLANS[existing.plan as PlanType]?.credits ?? 0;
        const newPlanCredits = PLANS[currentPlan].credits;
        const creditDelta = newPlanCredits - existingPlanCredits;

        // Use updateMany with the old plan in the where clause to prevent
        // race conditions from double-crediting on concurrent requests
        await prisma.user.updateMany({
          where: {
            clerkId: user.id,
            plan: existing.plan,
          },
          data: {
            plan: currentPlan,
            credits:
              creditDelta > 0
                ? existing.credits + creditDelta
                : existing.credits,
          },
        });

        // Re-fetch and return the updated record
        return await prisma.user.findUnique({
          where: {
            clerkId: user.id,
          },
        });
      }

      return existing;
    }

    // New user
    return await prisma.user.create({
      data: {
        clerkId: user.id,
        name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
        email: user.emailAddresses[0].emailAddress,
        imageUrl: user.imageUrl ?? "",
        credits: PLANS[currentPlan].credits,
        plan: currentPlan,
      },
    });
  } catch (error) {
    console.error("checkUser error:", error);
    return null;
  }
}
