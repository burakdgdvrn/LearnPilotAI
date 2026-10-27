import { test } from "node:test";
import assert from "node:assert/strict";
import { createAIProvider } from "../src/server/ai/provider-factory";
import { readAIConfig } from "../src/server/ai/config";
import { getHealth } from "../src/server/api/health";
const real = { AI_PROVIDER: "nebius", NEBIUS_API_KEY: "test-key-not-a-secret", NEBIUS_MODEL: "test-model" };

test("default development is explicitly mocked", async () => {
  const result = await createAIProvider({}).generate({ prompt: "fractions" });
  assert.equal(result.mocked, true);
  assert.equal(result.provider, "mock");
  assert.match(result.text, /MOCK/);
});
test("final mode rejects mock, missing credentials and invalid switches", () => {
  assert.throws(() => readAIConfig({ HACKATHON_FINAL: "true" }), /mock is forbidden/);
  assert.throws(() => readAIConfig({ AI_PROVIDER: "nebius" }), /requires/);
  assert.throws(() => readAIConfig({ AI_PROVIDER: "other" }), /AI_PROVIDER/);
  assert.throws(() => readAIConfig({ HACKATHON_FINAL: "TRUE" }), /HACKATHON_FINAL/);
  assert.throws(() => readAIConfig({ ...real, NEBIUS_BASE_URL: "http://example.com" }), /HTTPS/);
});
test("Nebius sends the chosen model and bounded request and reports real provenance", async () => {
  const fakeFetch: typeof fetch = async (input, init) => {
    assert.equal(input, "https://api.tokenfactory.nebius.com/v1/chat/completions");
    assert.equal((init?.headers as Record<string, string>).Authorization, "Bearer test-key-not-a-secret");
    const body = JSON.parse(init?.body as string);
    assert.equal(body.model, "test-model");
    assert.equal(body.messages[0].content, "hello");
    assert.equal(body.max_tokens, 128);
    assert.ok(init?.signal);
    return Response.json({ choices: [{ message: { content: "Hello!" } }] });
  };
  const result = await createAIProvider({ ...real, HACKATHON_FINAL: "true" }, fakeFetch).generate({ prompt: "hello" });
  assert.deepEqual(result, { provider: "nebius", model: "test-model", text: "Hello!", mocked: false });
});
test("HTTP, network and malformed/empty response failures never fall back to mock", async () => {
  for (const response of [
    new Response("private upstream details", { status: 401 }),
    Response.json({ choices: [] }),
    Response.json({ choices: [{ message: { content: " " } }] }),
    new Response("not json"),
  ]) {
    await assert.rejects(createAIProvider(real, async () => response).generate({ prompt: "hello" }));
  }
  await assert.rejects(createAIProvider(real, async () => { throw new Error("network failure"); }).generate({ prompt: "hello" }));
});
test("health liveness never leaks secrets or implies inference success", () => {
  const health = getHealth(real);
  assert.equal(health.ai.configurationValid, true);
  assert.equal(health.ai.inferenceVerified, false);
  assert.doesNotMatch(JSON.stringify(health), /test-key/);
  assert.equal(getHealth({ HACKATHON_FINAL: "true" }).ai.configurationValid, false);
});
