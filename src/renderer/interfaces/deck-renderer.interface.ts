import type { SlidePlan } from "@/presentation-engine/domain/slide-plan";

/**
 * Sprint 0 scope: contract only. No concrete renderer (pptxgenjs or
 * otherwise) is implemented yet.
 *
 * Any output format (PPTX today, PDF or Google Slides later) implements
 * this same interface. Feature code depends on `DeckRenderer`, never on
 * a rendering library directly, so adding a new output format never
 * requires touching the code that calls a renderer.
 */
export interface DeckRenderer {
  render(plan: SlidePlan): Promise<Buffer>;
  readonly fileExtension: string;
}
