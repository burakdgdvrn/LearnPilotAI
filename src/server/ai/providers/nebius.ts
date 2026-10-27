import type { AIConfig } from "../config";
import type { AIProvider } from "../types";
type NebiusConfig = Extract<AIConfig, { provider: "nebius" }>;
export function createNebiusProvider(config: NebiusConfig, request: typeof fetch = fetch): AIProvider {
  return {
    async generate({ prompt }) {
      const response = await request(`${config.baseUrl}/chat/completions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: config.model, messages: [{ role: "user", content: prompt }], max_tokens: 128, stream: false }),
        signal: AbortSignal.timeout(30_000),
      });
      // Never surface upstream bodies: they may contain prompts or account details.
      if (!response.ok) throw new Error(`Nebius inference failed (HTTP ${response.status}); no mock fallback.`);
      const text = extractText(await response.json());
      if (!text) throw new Error("Nebius returned no usable text; no mock fallback.");
      return { provider: "nebius", model: config.model, text, mocked: false };
    },
  };
}
function extractText(data: unknown): string | undefined {
  if (!data || typeof data !== "object" || !("choices" in data) || !Array.isArray(data.choices)) return;
  const message = data.choices[0]?.message;
  if (!message || typeof message !== "object" || typeof message.content !== "string") return;
  return message.content.trim() || undefined;
}
