/** HTTP/domain DTOs; keep these independent of framework and provider code. */
export interface LearningGoal {
  topic: string;
  level: "beginner" | "intermediate" | "advanced";
}
export interface LearningPlan {
  id: string;
  goal: LearningGoal;
  steps: Array<{ id: string; title: string; objective: string }>;
}

export type InitialLearningPlanRequest = LearningGoal;

export interface InitialLearningPlanResponse {
  plan: LearningPlan;
  preview: string;
  ai: { provider: "mock"; mocked: true; inferenceVerified: false };
}

export type LearningPlanErrorCode =
  | "VALIDATION_ERROR"
  | "PAYLOAD_TOO_LARGE"
  | "UNSUPPORTED_MEDIA_TYPE"
  | "LEARNING_PLAN_UNAVAILABLE"
  | "INTERNAL_ERROR";

export interface LearningPlanErrorResponse {
  error: { code: LearningPlanErrorCode; message: string };
}
