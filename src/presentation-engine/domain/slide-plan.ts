/**
 * Sprint 0 scope: type definitions only. No logic that turns an AI
 * outline into a `SlidePlan` exists yet (that belongs in
 * `strategy/`, in a later sprint).
 *
 * These types exist now because they are the shared vocabulary between
 * two things that must never depend on each other directly: the AI
 * layer (which will eventually produce a strategic outline) and the
 * renderer (which turns a `SlidePlan` into file bytes). Fixing this
 * shape early means both of those layers can be built against a stable
 * contract independently.
 */
export type SlideLayout = "title" | "section-header" | "content" | "two-column" | "quote" | "closing";

export interface SlideContent {
  layout: SlideLayout;
  heading: string;
  body: string[];
  speakerNotes?: string;
}

export interface SlidePlan {
  title: string;
  slides: SlideContent[];
}
