export type AIProviderName = "mock" | "nebius";
export interface HealthResponse {
  status: "ok";
  service: "learnpilotai";
  ai: {
    provider: AIProviderName | "invalid";
    configurationValid: boolean;
    finalMode: boolean;
    inferenceVerified: false;
  };
}
