import type { HealthResponse } from "../../contracts/health";
import { readAIConfig, type AIEnvironment } from "../ai/config";
export function getHealth(env: AIEnvironment = process.env): HealthResponse {
  let provider: HealthResponse["ai"]["provider"] = "invalid";
  let configurationValid = false;
  try {
    provider = readAIConfig(env).provider;
    configurationValid = true;
  } catch {
    // Liveness only: no paid provider calls and no credentials in output.
  }
  return { status: "ok", service: "learnpilotai", ai: {
    provider, configurationValid, finalMode: env.HACKATHON_FINAL === "true", inferenceVerified: false,
  } };
}
