import { test } from "node:test";
import assert from "node:assert/strict";
import { postLearningPlan } from "../src/server/api/learning-plan";
import { createAIProvider } from "../src/server/ai/provider-factory";
import { createInitialPlanFixture } from "../src/server/learning-engine/initial-plan";
import type { AIProvider } from "../src/server/ai/types";
import type { InitialLearningPlanResponse, LearningGoal } from "../src/contracts/learning";

const valid = { topic: "Kesirler", level: "beginner" };
const dependencies = {
  env: {},
  createProvider: () => createAIProvider({}),
  createPlan: createInitialPlanFixture,
};
function request(body: unknown = valid, contentType = "application/json"): Request {
  return new Request("http://localhost/api/learning/plan", {
    method: "POST", headers: { "Content-Type": contentType }, body: JSON.stringify(body),
  });
}
async function expectError(response: Response, status: number, code: string) {
  assert.equal(response.status, status);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.match(response.headers.get("content-type") ?? "", /application\/json/);
  const body = await response.json();
  assert.deepEqual(Object.keys(body), ["error"]);
  assert.deepEqual(Object.keys(body.error).sort(), ["code", "message"]);
  assert.equal(body.error.code, code);
  assert.equal(typeof body.error.message, "string");
  assert.doesNotMatch(JSON.stringify(body), /private-detail|test-key|NEBIUS|stack|SyntaxError/);
  return body;
}

test("all levels produce a normalized plan and explicit mock provenance through the real development provider", async () => {
  for (const level of ["beginner", "intermediate", "advanced"]) {
    const response = await postLearningPlan(request({ topic: "  Kesirler  ", level }, "application/json; charset=utf-8"), dependencies);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("cache-control"), "no-store");
    const body = await response.json() as InitialLearningPlanResponse;
    assert.deepEqual(body.plan.goal, { topic: "Kesirler", level });
    assert.deepEqual(body.ai, { provider: "mock", mocked: true, inferenceVerified: false });
    assert.equal(body.plan.steps.length, 3);
    assert.equal(new Set(body.plan.steps.map(step => step.id)).size, 3);
    assert.ok(body.plan.steps.every(step => step.title.includes("[MOCK]") && step.title.includes("Kesirler") && step.objective));
    assert.match(body.preview, /MOCK — no inference/);
    assert.ok(body.preview.includes(JSON.stringify(body.plan.goal)));
  }
});

test("invalid shapes, fields and topics fail before provider or planner execution", async () => {
  const unreachable = () => { assert.fail("Invalid input must not reach a dependency"); };
  const invalid = [
    null, [], "Kesirler", 1, true, {}, { topic: "Kesirler" }, { level: "beginner" },
    { ...valid, extra: true }, { ...valid, topic: 1 }, { ...valid, topic: null },
    { ...valid, topic: "" }, { ...valid, topic: "   " }, { ...valid, topic: "a".repeat(121) },
    { ...valid, topic: " ".repeat(120) + "a" },
    { ...valid, topic: "a\n" }, { ...valid, topic: "a\t" }, { ...valid, topic: "a\u0000b" },
    { ...valid, topic: "a\u202eb" }, { ...valid, level: "expert" }, { ...valid, level: 1 },
    { ...valid, level: "Beginner" }, { ...valid, level: " beginner " },
  ];
  for (const value of invalid) {
    await expectError(await postLearningPlan(request(value), {
      env: {}, createProvider: unreachable, createPlan: unreachable,
    }), 400, "VALIDATION_ERROR");
  }
});

test("topic length counts Unicode code points and accepts the boundary", async () => {
  const response = await postLearningPlan(request({ ...valid, topic: "🧠".repeat(120) }), dependencies);
  assert.equal(response.status, 200);
  await expectError(await postLearningPlan(request({ ...valid, topic: "🧠".repeat(121) }), dependencies), 400, "VALIDATION_ERROR");
});

test("malformed, empty JSON and invalid UTF-8 return safe errors", async () => {
  for (const body of ["", "{private-detail", new Uint8Array([0xff])]) {
    await expectError(await postLearningPlan(new Request("http://localhost", {
      method: "POST", headers: { "Content-Type": "application/json" }, body,
    }), dependencies), 400, "VALIDATION_ERROR");
  }
});

test("missing and unsupported content type are rejected", async () => {
  for (const contentType of ["", "text/plain", "application/jsonp", "application/ld+json"]) {
    await expectError(await postLearningPlan(request(valid, contentType), dependencies), 415, "UNSUPPORTED_MEDIA_TYPE");
  }
  await expectError(await postLearningPlan(new Request("http://localhost", { method: "POST" }), dependencies), 415, "UNSUPPORTED_MEDIA_TYPE");
});

test("body byte limit accepts 4096 bytes and rejects 4097 even with a misleading length header", async () => {
  const json = JSON.stringify(valid);
  for (const [size, status] of [[4096, 200], [4097, 413]]) {
    const response = await postLearningPlan(new Request("http://localhost", {
      method: "POST", headers: { "Content-Type": "application/json", "Content-Length": "1" },
      body: json.padEnd(size, " "),
    }), dependencies);
    if (status === 200) assert.equal(response.status, 200);
    else await expectError(response, status, "PAYLOAD_TOO_LARGE");
  }
  // Multi-byte input is limited by bytes, not JS string length.
  await expectError(await postLearningPlan(request({ ...valid, topic: "🧠".repeat(1100) }), dependencies), 413, "PAYLOAD_TOO_LARGE");
});

test("streamed bodies are bounded and cancellation occurs on overflow", async () => {
  let cancelled = false;
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new Uint8Array(3000).fill(32));
      controller.enqueue(new Uint8Array(1097).fill(32));
    },
    cancel() { cancelled = true; },
  });
  const req = new Request("http://localhost", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: stream, duplex: "half",
  } as RequestInit & { duplex: string });
  await expectError(await postLearningPlan(req, dependencies), 413, "PAYLOAD_TOO_LARGE");
  assert.equal(cancelled, true);
});

test("stream read errors do not expose private details", async () => {
  const stream = new ReadableStream<Uint8Array>({ start(controller) { controller.error(new Error("private-detail")); } });
  const req = new Request("http://localhost", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: stream, duplex: "half",
  } as RequestInit & { duplex: string });
  await expectError(await postLearningPlan(req, dependencies), 400, "VALIDATION_ERROR");
});

test("final, Nebius and invalid configurations never construct a provider or generate a fixture", async () => {
  const unreachable = () => { assert.fail("Guard must reject before constructing paid provider or plan"); };
  const real = { AI_PROVIDER: "nebius", NEBIUS_API_KEY: "test-key-not-a-secret", NEBIUS_MODEL: "test-model" };
  for (const env of [
    { HACKATHON_FINAL: "true" }, { AI_PROVIDER: "mock", HACKATHON_FINAL: "true" },
    real, { ...real, HACKATHON_FINAL: "true" }, { AI_PROVIDER: "nebius" },
    { AI_PROVIDER: "unknown" }, { HACKATHON_FINAL: "TRUE" },
  ]) {
    await expectError(await postLearningPlan(request(), {
      env, createProvider: unreachable, createPlan: unreachable,
    }), 503, "LEARNING_PLAN_UNAVAILABLE");
  }
});

test("provider construction and generation failures map safely without fallback", async () => {
  let calls = 0;
  for (const createProvider of [
    () => { calls++; throw new Error("private-detail test-key"); },
    () => ({ async generate() { calls++; throw new Error("private-detail test-key"); } }),
  ]) {
    await expectError(await postLearningPlan(request(), {
      ...dependencies, createProvider, createPlan: () => assert.fail("No fallback plan"),
    }), 503, "LEARNING_PLAN_UNAVAILABLE");
  }
  assert.equal(calls, 2);
});

test("non-mock, inconsistent and empty provider results cannot be mislabelled as mock success", async () => {
  for (const result of [
    { provider: "nebius", mocked: false, text: "private-detail" },
    { provider: "mock", mocked: false, text: "private-detail" },
    { provider: "mock", mocked: true, text: " " },
  ]) {
    const provider = { async generate() { return { ...result, model: "fixture" }; } } as AIProvider;
    await expectError(await postLearningPlan(request(), {
      ...dependencies, createProvider: () => provider,
      createPlan: () => assert.fail("No fallback plan"),
    }), 503, "LEARNING_PLAN_UNAVAILABLE");
  }
});

test("unexpected planning failures return a fixed internal error", async () => {
  await expectError(await postLearningPlan(request(), {
    ...dependencies, createPlan: () => { throw new Error("private-detail test-key"); },
  }), 500, "INTERNAL_ERROR");
});

test("learning fixture is deterministic, preserves the goal and does not share mutable state", () => {
  const goal: LearningGoal = { topic: "Kesirler", level: "beginner" };
  const first = createInitialPlanFixture(goal);
  assert.deepEqual(first, createInitialPlanFixture(goal));
  first.goal.topic = "changed";
  first.steps[0].title = "changed";
  assert.equal(goal.topic, "Kesirler");
  assert.match(createInitialPlanFixture(goal).steps[0].title, /MOCK.*Kesirler/);
});
