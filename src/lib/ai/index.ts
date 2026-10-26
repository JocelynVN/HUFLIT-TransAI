import { AIProvider } from "./types";
import { MockAIProvider } from "./mockProvider";
import { LiveAIProvider } from "./liveProvider";

export * from "./types";
export * from "./schema";

export function getAIProvider(): AIProvider {
  const providerType = process.env.AI_PROVIDER?.toLowerCase() || "mock";

  if (providerType === "gemini" && process.env.GEMINI_API_KEY) {
    return new LiveAIProvider("gemini");
  }

  if (providerType === "openai" && process.env.OPENAI_API_KEY) {
    return new LiveAIProvider("openai");
  }

  // Default to reliable mock provider for development, tests, and offline runs
  return new MockAIProvider();
}
