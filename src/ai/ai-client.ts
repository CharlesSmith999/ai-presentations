import type { ZodSchema } from "zod";
import { appConfig } from "@/config/app-config";
import { AiInvalidResponseError } from "@/shared/errors/app-error";
import { createLogger } from "@/shared/logging/logger";
import { OpenAiProvider } from "@/ai/providers/openai.provider";
import { AnthropicProvider } from "@/ai/providers/anthropic.provider";
import type { AiMessage, AiProvider, AiProviderName } from "@/ai/providers/ai-provider.interface";

const log = createLogger("ai:client");

const providerRegistry: Record<AiProviderName, () => AiProvider> = {
  openai: () => new OpenAiProvider(),
  anthropic: () => new AnthropicProvider(),
};

export interface StructuredAiRequest<T> {
  system: string;
  messages: AiMessage[];
  schema: ZodSchema<T>;
  provider?: AiProviderName;
  model?: string;
  temperature?: number;
}

/**
 * The single entry point every feature uses to talk to an AI provider.
 * Enforces the project rule "AI outputs structured JSON only":
 *   1. augments the system prompt with an explicit JSON-only instruction,
 *   2. JSON.parses the raw text response,
 *   3. validates the parsed value against the caller-supplied Zod schema,
 *   4. retries (up to appConfig.ai.maxRetries) with a corrective
 *      follow-up message before giving up and throwing
 *      AiInvalidResponseError.
 *
 * Feature code never talks to `AiProvider` directly.
 */
export async function getStructuredCompletion<T>(request: StructuredAiRequest<T>): Promise<T> {
  const providerName = request.provider ?? appConfig.ai.defaultProvider;
  const provider = providerRegistry[providerName]();

  const jsonInstruction =
    "You must respond with a single valid JSON object and nothing else — " +
    "no prose, no markdown code fences, no explanation before or after the JSON.";

  const messages: AiMessage[] = [
    { role: "system", content: `${request.system}\n\n${jsonInstruction}` },
    ...request.messages,
  ];

  let lastError: unknown;

  for (let attempt = 0; attempt <= appConfig.ai.maxRetries; attempt++) {
    try {
      const completion = await provider.complete({
        messages: attempt === 0 ? messages : appendCorrection(messages, lastError),
        model: request.model,
        temperature: request.temperature,
      });

      const parsedJson = safeJsonParse(completion.rawText);
      const validated = request.schema.safeParse(parsedJson);

      if (!validated.success) {
        throw new AiInvalidResponseError("AI response did not match the expected schema", {
          context: { issues: validated.error.issues, rawText: completion.rawText },
        });
      }

      return validated.data;
    } catch (error) {
      lastError = error;
      log.warn({ err: error, attempt, provider: providerName }, "Structured AI completion attempt failed");
    }
  }

  throw new AiInvalidResponseError(
    `AI provider "${providerName}" failed to produce a valid structured response after ${appConfig.ai.maxRetries + 1} attempt(s)`,
    { cause: lastError },
  );
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new AiInvalidResponseError("AI response was not valid JSON", { cause: error, context: { rawText: text } });
  }
}

function appendCorrection(messages: AiMessage[], lastError: unknown): AiMessage[] {
  const reason = lastError instanceof Error ? lastError.message : "the response was invalid";
  return [
    ...messages,
    {
      role: "user",
      content: `Your previous response was rejected because: ${reason}. Respond again with ONLY a corrected JSON object.`,
    },
  ];
}
