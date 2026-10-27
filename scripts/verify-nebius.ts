import { loadEnvConfig } from "@next/env";
import { readAIConfig } from "../src/server/ai/config";
import { createAIProvider } from "../src/server/ai/provider-factory";
loadEnvConfig(process.cwd());
async function main() {
  const config = readAIConfig();
  if (config.provider !== "nebius") throw new Error("Verification requires AI_PROVIDER=nebius; mock cannot pass.");
  const result = await createAIProvider().generate({ prompt: "Reply with a short greeting for a learning app." });
  if (result.mocked || result.provider !== "nebius") throw new Error("Real inference required.");
  // Never print keys, prompts or generated content.
  console.log(JSON.stringify({ provider: result.provider, model: result.model, mocked: result.mocked,
    inferenceVerified: true, verifiedAt: new Date().toISOString() }));
}
main().catch(() => {
  console.error("Nebius verification failed. Check configuration, model access and provider status. No mock fallback.");
  process.exitCode = 1;
});
