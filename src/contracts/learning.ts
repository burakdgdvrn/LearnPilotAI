/** Proposed v1 domain seam; learning endpoints are not implemented yet. */
export interface LearningGoal {
  topic: string;
  level: "beginner" | "intermediate" | "advanced";
}
export interface LearningPlan {
  id: string;
  goal: LearningGoal;
  steps: Array<{ id: string; title: string; objective: string }>;
}
