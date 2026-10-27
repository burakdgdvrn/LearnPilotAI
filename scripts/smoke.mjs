import { spawn } from "node:child_process";
import assert from "node:assert/strict";
import { setTimeout as delay } from "node:timers/promises";

const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-H", "127.0.0.1", "-p", "3107"], {
  stdio: ["ignore", "pipe", "pipe"],
  env: { ...process.env, AI_PROVIDER: "mock", HACKATHON_FINAL: "false" },
});
let output = "";
server.stdout.on("data", chunk => { output += chunk; });
server.stderr.on("data", chunk => { output += chunk; });
try {
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    if (server.exitCode !== null) throw new Error("Server exited before readiness.");
    try {
      const response = await fetch("http://127.0.0.1:3107/api/health", { signal: AbortSignal.timeout(1000) });
      if (response.ok) { ready = true; break; }
    } catch {}
    await delay(500);
  }
  assert.ok(ready, "Production server must start.");
  const healthResponse = await fetch("http://127.0.0.1:3107/api/health");
  assert.equal(healthResponse.headers.get("cache-control"), "no-store");
  assert.deepEqual(await healthResponse.json(), {
    status: "ok", service: "learnpilotai",
    ai: { provider: "mock", configurationValid: true, finalMode: false, inferenceVerified: false },
  });
  const home = await fetch("http://127.0.0.1:3107");
  assert.equal(home.status, 200);
  assert.match(await home.text(), /LEARNPILOTAI/);
  const planResponse = await fetch("http://127.0.0.1:3107/api/learning/plan", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic: "  Kesirler  ", level: "beginner" }),
  });
  assert.equal(planResponse.status, 200);
  assert.equal(planResponse.headers.get("cache-control"), "no-store");
  const plan = await planResponse.json();
  assert.deepEqual(plan.plan.goal, { topic: "Kesirler", level: "beginner" });
  assert.equal(plan.plan.steps.length, 3);
  assert.ok(plan.plan.steps.every(step => step.title.startsWith("[MOCK]")));
  assert.match(plan.preview, /MOCK — no inference/);
  assert.deepEqual(plan.ai, { provider: "mock", mocked: true, inferenceVerified: false });
  const invalidResponse = await fetch("http://127.0.0.1:3107/api/learning/plan", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic: " ", level: "expert" }),
  });
  assert.equal(invalidResponse.status, 400);
  assert.equal(invalidResponse.headers.get("cache-control"), "no-store");
  assert.equal((await invalidResponse.json()).error.code, "VALIDATION_ERROR");
  console.log("Production homepage, health and mocked learning plan smoke checks passed.");
} catch (error) {
  console.error(output);
  throw error;
} finally {
  server.kill();
}
