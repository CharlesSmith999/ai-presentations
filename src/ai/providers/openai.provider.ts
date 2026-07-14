import OpenAI from "openai";
import { env } from "@/config/env";
import { appConfig } from "@/config/app-config";
import { AiProviderError } from "@/shared/errors/app-error";
import { createLogger } from "@/shared/logging/logger";
import type { AiCompletionRequest, AiCompletionResult, AiProvider } from "@/ai/providers/ai-provider.interface";

const log = createLogger("ai:openai-provider");

export class OpenAiProvider implements AiProvider {
  public readonly name = "openai" as const;
  private readonly client: OpenAI;

  constructor(client?: OpenAI) {
    this.client = client ?? new OpenAI({ apiKey: env.OPENAI_API_KEY });
  }

  async complete(request: AiCompletionRequest): Promise<AiCompletionResult> {
    try {
      const response = await this.client.chat.completions.create(
        {
          model: request.model ?? "gpt-4.1",
          messages: request.messages.map((m) => ({ role: m.role, content: m.content })),
          temperature: request.temperature ?? 0.4,
          max_tokens: request.maxOutputTokens ?? 4096,
          response_format: { type: "json_object" },
        },
        { timeout: appConfig.ai.requestTimeoutMs },
      );

      const choice = response.choices[0];
      const text = choice?.message?.content;

      if (!text) {
        throw new AiProviderError("OpenAI response contained no message content");
      }

      return {
        rawText: text,
        model: response.model,
        provider: this.name,
        usage: {
          inputTokens: response.usage?.prompt_tokens ?? 0,
          outputTokens: response.usage?.completion_tokens ?? 0,
        },
      };
    } catch (error) {
      log.error({ err: error }, "OpenAI completion request failed");
      if (error instanceof AiProviderError) throw error;
      throw new AiProviderError("OpenAI provider request failed", { cause: error });
    }
  }
}
