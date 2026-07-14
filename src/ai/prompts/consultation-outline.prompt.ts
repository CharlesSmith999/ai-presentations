import type { AiMessage } from "@/ai/providers/ai-provider.interface";

export interface ConsultationBrief {
  goal: string;
  audienceDescription: string;
  context: string;
  constraints: string[];
}

/**
 * Prompt templates live here, isolated from both the AI client
 * (transport) and the use-cases (orchestration), so prompt engineering
 * can be iterated on independently of calling code.
 */
const SYSTEM_PROMPT = `You are a senior presentation strategy consultant. You do not design slides —
you diagnose what a presentation needs to achieve, for whom, and why the audience
should be persuaded. You think in terms of narrative arcs, audience psychology,
and decision criteria, not slide layouts or bullet counts.`;

export function buildConsultationOutlinePrompt(brief: ConsultationBrief): { system: string; messages: AiMessage[] } {
  const userPrompt = [
    `Goal of this presentation: ${brief.goal}`,
    `Audience: ${brief.audienceDescription}`,
    `Context / background: ${brief.context}`,
    brief.constraints.length > 0 ? `Constraints: ${brief.constraints.join("; ")}` : null,
    "",
    "Produce a consulting outline that a presenter could act on immediately.",
  ]
    .filter((line): line is string => line !== null)
    .join("\n");

  return {
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  };
}
