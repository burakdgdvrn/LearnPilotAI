// App imports use index.ts for the server-only guard; CLI/tests use this seam.
import { readAIConfig, type AIEnvironment } from "./config";
import { mockProvider } from "./providers/mock";
import { createNebiusProvider } from "./providers/nebius";
import type { AIProvider } from "./types";
export function createAIProvider(env: AIEnvironment = process.env, request: typeof fetch = fetch): AIProvider {
  const config = readAIConfig(env);
  return config.provider === "mock" ? mockProvider : createNebiusProvider(config, request);
}
