export interface AIRequest { prompt: string; }
export interface AIResult {
  provider: "mock" | "nebius";
  model: string;
  text: string;
  mocked: boolean;
}
export interface AIProvider { generate(request: AIRequest): Promise<AIResult>; }
