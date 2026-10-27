import type {
  InitialLearningPlanResponse, LearningGoal, LearningPlan,
  LearningPlanErrorCode, LearningPlanErrorResponse,
} from "../../contracts/learning";
import { readAIConfig, type AIEnvironment } from "../ai/config";
import type { AIProvider } from "../ai/types";

interface Dependencies {
  createProvider: () => AIProvider;
  createPlan: (goal: LearningGoal) => LearningPlan;
  env?: AIEnvironment;
}

const MAX_BODY_BYTES = 4096;
const headers = { "Cache-Control": "no-store" };

function failure(status: number, code: LearningPlanErrorCode, message: string): Response {
  return Response.json({ error: { code, message } } satisfies LearningPlanErrorResponse, { status, headers });
}

function unavailable(): Response {
  return failure(503, "LEARNING_PLAN_UNAVAILABLE", "Öğrenme planı şu anda kullanılamıyor.");
}

function parseGoal(value: unknown): LearningGoal | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return;
  const fields = Object.keys(value);
  if (fields.length !== 2 || !fields.includes("topic") || !fields.includes("level")) return;
  const { topic, level } = value as Record<string, unknown>;
  if (typeof topic !== "string" || typeof level !== "string") return;
  // Reject controls before trimming, so newlines/tabs cannot be silently accepted.
  if (/[\p{Cc}\p{Cf}]/u.test(topic)) return;
  if (Array.from(topic).length > 120) return;
  const normalized = topic.trim();
  if (!normalized) return;
  if (level !== "beginner" && level !== "intermediate" && level !== "advanced") return;
  return { topic: normalized, level };
}

export async function postLearningPlan(request: Request, dependencies: Dependencies): Promise<Response> {
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    return failure(415, "UNSUPPORTED_MEDIA_TYPE", "Content-Type application/json olmalıdır.");
  }

  let goal: LearningGoal | undefined;
  const reader = request.body?.getReader();
  try {
    const chunks: Uint8Array[] = [];
    let size = 0;
    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > MAX_BODY_BYTES) {
          // Do not wait for an untrusted producer to finish cancellation.
          void reader.cancel().catch(() => {});
          return failure(413, "PAYLOAD_TOO_LARGE", "İstek gövdesi en fazla 4096 bayt olabilir.");
        }
        chunks.push(value);
      }
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    goal = parseGoal(JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)));
  } catch {
    // Never reflect input, parser errors or stream failure details.
  } finally {
    reader?.releaseLock();
  }
  if (!goal) return failure(400, "VALIDATION_ERROR", "Konu ve seviye girdisini kontrol edin.");

  let preview: string;
  try {
    const config = readAIConfig(dependencies.env ?? process.env);
    // Auth/quota are not implemented. Never construct or call a paid provider here.
    if (config.provider !== "mock") return unavailable();
    const result = await dependencies.createProvider().generate({ prompt: JSON.stringify(goal) });
    if (result.provider !== "mock" || result.mocked !== true || !result.text.trim()) return unavailable();
    preview = result.text;
  } catch {
    return unavailable();
  }

  try {
    const response: InitialLearningPlanResponse = {
      plan: dependencies.createPlan(goal), preview,
      ai: { provider: "mock", mocked: true, inferenceVerified: false },
    };
    return Response.json(response, { headers });
  } catch {
    return failure(500, "INTERNAL_ERROR", "Öğrenme planı oluşturulamadı.");
  }
}
