export type AIEnvironment = Record<string, string | undefined>;
export type AIConfig =
  | { provider: "mock"; finalMode: false }
  | { provider: "nebius"; finalMode: boolean; apiKey: string; baseUrl: string; model: string };

export function readAIConfig(env: AIEnvironment = process.env): AIConfig {
  const finalValue = env.HACKATHON_FINAL ?? "false";
  if (!["true", "false"].includes(finalValue)) throw new Error("HACKATHON_FINAL must be true or false.");
  const finalMode = finalValue === "true";
  const provider = env.AI_PROVIDER ?? "mock";
  if (provider !== "mock" && provider !== "nebius") throw new Error("AI_PROVIDER must be mock or nebius.");
  if (provider === "mock") {
    if (finalMode) throw new Error("Final hackathon mode requires real Nebius inference; mock is forbidden.");
    return { provider, finalMode: false };
  }
  const apiKey = env.NEBIUS_API_KEY?.trim();
  const model = env.NEBIUS_MODEL?.trim();
  if (!apiKey || !model) throw new Error("Nebius requires NEBIUS_API_KEY and NEBIUS_MODEL.");
  const url = new URL(env.NEBIUS_BASE_URL ?? "https://api.tokenfactory.nebius.com/v1");
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) {
    throw new Error("NEBIUS_BASE_URL must be an HTTPS API base URL without credentials, query or fragment.");
  }
  return { provider, finalMode, apiKey, model, baseUrl: url.toString().replace(/\/$/, "") };
}
