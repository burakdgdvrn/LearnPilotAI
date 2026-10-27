import { createAIProvider } from "@/server/ai";
import { postLearningPlan } from "@/server/api/learning-plan";
import { createInitialPlanFixture } from "@/server/learning-engine";

export const dynamic = "force-dynamic";

export function POST(request: Request) {
  return postLearningPlan(request, {
    createProvider: () => createAIProvider(),
    createPlan: createInitialPlanFixture,
  });
}
