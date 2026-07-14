import { z } from "zod";

/**
 * The contract between "the intelligence" (AI layer) and "the output"
 * (the presentation engine / renderer). Intentionally narrative-first:
 * the consultant's job is to produce a strategy — audience analysis,
 * narrative arc, key arguments — not slide bullet points. Slide-level
 * structure is a downstream concern of the presentation-engine, built
 * from this outline.
 */
export const audienceProfileSchema = z.object({
  description: z.string().min(1),
  primaryConcerns: z.array(z.string().min(1)).min(1),
  decisionCriteria: z.array(z.string().min(1)).min(1),
});

export const narrativeSectionSchema = z.object({
  title: z.string().min(1),
  purpose: z.string().min(1),
  keyMessage: z.string().min(1),
  supportingPoints: z.array(z.string().min(1)).min(1).max(6),
  suggestedVisual: z.string().min(1),
});

export const consultationOutlineSchema = z.object({
  thesis: z.string().min(1).describe("The single core argument the entire presentation must prove"),
  audience: audienceProfileSchema,
  narrativeArc: z.array(narrativeSectionSchema).min(3).max(20),
  risks: z.array(z.string().min(1)).describe("Objections or weaknesses the presenter should be ready to address"),
  recommendedTone: z.enum(["formal", "conversational", "urgent", "inspirational", "analytical"]),
});

export type ConsultationOutline = z.infer<typeof consultationOutlineSchema>;
export type NarrativeSection = z.infer<typeof narrativeSectionSchema>;
export type AudienceProfile = z.infer<typeof audienceProfileSchema>;
