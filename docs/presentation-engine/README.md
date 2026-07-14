# `src/presentation-engine` — Presentation Engine

The layer between "AI strategy" and "rendered file." Its job is to turn
a strategic outline (thesis, narrative arc, audience analysis — produced
by the AI layer) into a concrete, ordered `SlidePlan`: a list of slides
with a layout and content model, ready to be handed to a renderer.

This is its own layer, separate from both `src/ai` and `src/renderer`,
because it is a distinct concern:

- `src/ai` decides *what to argue and why* — no notion of "slides"
  exists there.
- `src/presentation-engine` (this folder) decides *how the argument maps
  onto a sequence of slides.*
- `src/renderer` decides *how a slide plan becomes bytes* — it has no
  idea what a "narrative arc" is.

## Folders

- `domain/` — shared types (`SlidePlan`, `SlideContent`, `SlideLayout`).
- `strategy/` — `outline-to-slide-plan.strategy.ts`: the deterministic
  transformation from a `ConsultationOutline` to a `SlidePlan`.

## Status

Implemented. `buildSlidePlanFromOutline()` is deliberately **not**
another AI call — once the AI layer has done the strategic thinking,
mapping it onto slides (one slide per narrative section, a title slide,
a risks/objections slide, a closing slide) is a structural concern with
clear rules. Being rule-based makes it fast, free, and perfectly
reproducible for a given outline. It also enforces
`appConfig.consultation.maxSlidesPerDeck`, throwing a `ValidationError`
if a narrative arc would produce an unreasonably long deck.

## Adding a new output shape

Add a new case to the `SlideLayout` union in `domain/slide-plan.ts`,
extend `outline-to-slide-plan.strategy.ts`'s mapping logic if a new AI
output field should map to it, then implement the corresponding drawing
method in every `DeckRenderer` implementation (see `/docs/architecture`
and `src/renderer/pptx/pptx-renderer.ts`).
