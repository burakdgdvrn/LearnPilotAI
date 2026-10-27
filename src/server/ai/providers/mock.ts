import type { AIProvider } from "../types";
export const mockProvider: AIProvider = {
  async generate({ prompt }) {
    return { provider: "mock", model: "development-fixture",
      text: `[MOCK — no inference] Learning preview for: ${prompt}`, mocked: true };
  },
};
