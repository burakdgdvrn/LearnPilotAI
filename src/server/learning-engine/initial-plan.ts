import type { LearningGoal, LearningPlan } from "../../contracts/learning";

/** Development fixture only; no adaptive learning or persistence. */
export function createInitialPlanFixture(goal: LearningGoal): LearningPlan {
  return {
    id: "mock-initial-plan",
    goal: { ...goal },
    steps: [
      { id: "foundation", title: `[MOCK] Temeller: ${goal.topic}`,
        objective: `${goal.level} seviyesi için temel kavramları gözden geçir.` },
      { id: "practice", title: `[MOCK] Alıştırma: ${goal.topic}`,
        objective: `${goal.level} seviyesinde bir örnek üzerinde çalış.` },
      { id: "review", title: `[MOCK] Tekrar: ${goal.topic}`,
        objective: "Öğrendiklerini kendi sözlerinle özetle." },
    ],
  };
}
