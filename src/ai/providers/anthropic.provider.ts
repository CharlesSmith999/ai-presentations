import Anthropic from "@anthropic-ai/sdk";
import { env } from "@/config/env";
import { appConfig } from "@/config/app-config";
import { AiProviderError } from "@/shared/errors/app-error";
import { createLogger } from "@/shared/logging/logger";
import type { AiCompletionRequest, AiCompletionResult, AiProvider } from "@/ai/providers/ai-provider.interface";

const log = createLogger("ai:anthropic-provider");

export class AnthropicProvider implements AiProvider {
  public readonly name = "anthropic" as const;
  private readonly client: Anthropic;

  constructor(client?: Anthropic) {
    this.client = client ?? new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  }

  async complete(request: AiCompletionRequest): Promise<AiCompletionResult> {
    const systemMessages = request.messages.filter((m) => m.role === "system").map((m) => m.content);
    const conversationMessages = request.messages
      .filter((m): m is { role: "user" | "assistant"; content: string } => m.role !== "system")
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const response = await this.client.messages.create(
        {
          model: request.model ?? appConfig.ai.defaultModel,
          system: systemMessages.join("\n\n") || undefined,
          messages: conversationMessages,
          max_tokens: request.maxOutputTokens ?? 4096,
          temperature: request.temperature ?? 0.4,
        },
        { timeout: appConfig.ai.requestTimeoutMs },
      );

      const textBlock = response.content.find((block) => block.type === "text");

      if (!textBlock || textBlock.type !== "text") {
        throw new AiProviderError("Anthropic response contained no text block");
      }

      return {
        rawText: textBlock.text,
        model: response.model,
        provider: this.name,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        },
      };
    } catch (error) {
      log.error({ err: error }, "Anthropic completion request failed");
      if (error instanceof AiProviderError) throw error;
      throw new AiProviderError("Anthropic provider request failed", { cause: error });
    }
  }
}
