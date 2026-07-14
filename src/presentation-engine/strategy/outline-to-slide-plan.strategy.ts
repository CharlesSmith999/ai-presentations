import type { ConsultationOutline, NarrativeSection } from "@/ai/schemas/consultation-outline.schema";
import type { SlideContent, SlidePlan } from "@/presentation-engine/domain/slide-plan";
import { appConfig } from "@/config/app-config";
import { ValidationError } from "@/shared/errors/app-error";

/**
 * Deterministic transformation from a `ConsultationOutline` to a
 * `SlidePlan`. Once the strategic thinking has been produced by the AI
 * layer, mapping it onto slides is a structural concern with clear
 * rules — doing it deterministically is faster, cheaper, and perfectly
 * reproducible for a given outline.
 */
export function buildSlidePlanFromOutline(outline: ConsultationOutline): SlidePlan {
  const slides: SlideContent[] = [];

  slides.push({
    layout: "title",
    heading: outline.thesis,
    body: [],
    speakerNotes: `Recommended tone: ${outline.recommendedTone}.`,
  });

  for (const section of outline.narrativeArc) {
    slides.push(sectionToSlide(section));
  }

  if (outline.risks.length > 0) {
    slides.push({
      layout: "content",
      heading: "Anticipated Questions & Objections",
      body: outline.risks,
    });
  }

  slides.push({
    layout: "closing",
    heading: "Thank you",
    body: [outline.thesis],
  });

  if (slides.length > appConfig.consultation.maxSlidesPerDeck) {
    throw new ValidationError(
      `The generated outline would produce ${slides.length} slides, exceeding the maximum of ${appConfig.consultation.maxSlidesPerDeck}. Narrow the narrative arc.`,
    );
  }

  return { title: outline.thesis, slides };
}

function sectionToSlide(section: NarrativeSection): SlideContent {
  return {
    layout: section.supportingPoints.length > 3 ? "two-column" : "content",
    heading: section.title,
    body: [section.keyMessage, ...section.supportingPoints],
    speakerNotes: `Purpose: ${section.purpose}. Suggested visual: ${section.suggestedVisual}.`,
  };
}
