/**
 * Sprint 0 scope: this is a CONTRACT only. No concrete provider
 * (OpenAI/Anthropic adapter), no prompts, no completion logic is
 * implemented yet — that is explicitly out of scope for this sprint.
 *
 * The interface is defined now so the rest of the AI layer's shape
 * (folders: providers/, prompts/, schemas/) is fixed by an actual
 * contract rather than a guess, and so later sprints implement
 * `AiProvider` rather than inventing a different shape ad hoc. Every
 * concrete provider the AI layer eventually adds must satisfy this
 * interface; nothing outside `src/ai` should ever depend on a specific
 * provider's SDK types.
 */
export interface AiMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AiCompletionRequest {
  messages: AiMessage[];
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
}

export interface AiCompletionResult {
  rawText: string;
  model: string;
  provider: AiProviderName;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}

export type AiProviderName = "openai" | "anthropic";

export interface AiProvider {
  readonly name: AiProviderName;
  complete(request: AiCompletionRequest): Promise<AiCompletionResult>;
}
