import "server-only";
export { createAIProvider } from "./provider-factory";
export type { AIProvider, AIRequest, AIResult } from "./types";

// ─── Adaptif Çalışma Planı Modülü ────────────────────────────────────────────
export { generateStudyPlan } from "./ai-service";
export { parseAIResponse } from "./utils";
export { SYSTEM_PROMPT } from "./prompts";
export type {
  StudentData,
  TestResult,
  StudentSchedule,
  StudyPlan,
  StudySession,
  AIServiceError,
} from "./types";
