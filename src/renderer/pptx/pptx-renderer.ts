import PptxGenJS from "pptxgenjs";
import type { DeckRenderer } from "@/renderer/interfaces/deck-renderer.interface";
import type { SlideContent, SlidePlan } from "@/presentation-engine/domain/slide-plan";
import { defaultTheme, type DeckTheme } from "@/renderer/themes/default-theme";
import { RenderError } from "@/shared/errors/app-error";
import { createLogger } from "@/shared/logging/logger";

const log = createLogger("renderer:pptx");

/**
 * Renders a format-agnostic `SlidePlan` into actual `.pptx` bytes.
 * Layout-specific drawing logic is isolated into one private method per
 * `SlideLayout` variant, so adding a new layout is one method plus one
 * switch-case, not a restructure of the whole renderer.
 */
export class PptxRenderer implements DeckRenderer {
  public readonly fileExtension = "pptx";

  constructor(private readonly theme: DeckTheme = defaultTheme) {}

  async render(plan: SlidePlan): Promise<Buffer> {
    try {
      const pres = new PptxGenJS();
      pres.author = "AI Presentation Consultant";
      pres.title = plan.title;

      for (const slide of plan.slides) {
        this.renderSlide(pres, slide);
      }

      const output = await pres.write({ outputType: "nodebuffer" });
      return output as Buffer;
    } catch (error) {
      log.error({ err: error, title: plan.title }, "Failed to render presentation");
      throw new RenderError("Failed to render the presentation file", { cause: error });
    }
  }

  private renderSlide(pres: PptxGenJS, content: SlideContent): void {
    const slide = pres.addSlide();
    slide.background = { color: this.theme.colors.background };

    switch (content.layout) {
      case "title":
        return this.renderTitleSlide(slide, content);
      case "section-header":
        return this.renderSectionHeaderSlide(slide, content);
      case "two-column":
        return this.renderTwoColumnSlide(slide, content);
      case "quote":
        return this.renderQuoteSlide(slide, content);
      case "closing":
        return this.renderClosingSlide(slide, content);
      case "content":
      default:
        return this.renderContentSlide(slide, content);
    }
  }

  private renderTitleSlide(slide: PptxGenJS.Slide, content: SlideContent): void {
    slide.addText(content.heading, {
      x: 0.5,
      y: 2.2,
      w: 9,
      h: 1.5,
      fontFace: this.theme.fontFamily,
      fontSize: this.theme.fontSizes.title,
      color: this.theme.colors.heading,
      bold: true,
      align: "center",
    });
    if (content.speakerNotes) slide.addNotes(content.speakerNotes);
  }

  private renderSectionHeaderSlide(slide: PptxGenJS.Slide, content: SlideContent): void {
    slide.addText(content.heading, {
      x: 0.5,
      y: 2.5,
      w: 9,
      h: 1,
      fontFace: this.theme.fontFamily,
      fontSize: this.theme.fontSizes.heading,
      color: this.theme.colors.accent,
      bold: true,
    });
    if (content.speakerNotes) slide.addNotes(content.speakerNotes);
  }

  private renderContentSlide(slide: PptxGenJS.Slide, content: SlideContent): void {
    slide.addText(content.heading, {
      x: 0.5,
      y: 0.4,
      w: 9,
      h: 0.8,
      fontFace: this.theme.fontFamily,
      fontSize: this.theme.fontSizes.heading,
      color: this.theme.colors.heading,
      bold: true,
    });
    slide.addText(content.body.map((line) => ({ text: line, options: { bullet: true, breakLine: true } })), {
      x: 0.5,
      y: 1.4,
      w: 9,
      h: 4,
      fontFace: this.theme.fontFamily,
      fontSize: this.theme.fontSizes.body,
      color: this.theme.colors.body,
    });
    if (content.speakerNotes) slide.addNotes(content.speakerNotes);
  }

  private renderTwoColumnSlide(slide: PptxGenJS.Slide, content: SlideContent): void {
    const midpoint = Math.ceil(content.body.length / 2);
    const left = content.body.slice(0, midpoint);
    const right = content.body.slice(midpoint);

    slide.addText(content.heading, {
      x: 0.5,
      y: 0.4,
      w: 9,
      h: 0.8,
      fontFace: this.theme.fontFamily,
      fontSize: this.theme.fontSizes.heading,
      color: this.theme.colors.heading,
      bold: true,
    });
    slide.addText(left.map((line) => ({ text: line, options: { bullet: true, breakLine: true } })), {
      x: 0.5,
      y: 1.4,
      w: 4.3,
      h: 4,
      fontFace: this.theme.fontFamily,
      fontSize: this.theme.fontSizes.body,
      color: this.theme.colors.body,
    });
    slide.addText(right.map((line) => ({ text: line, options: { bullet: true, breakLine: true } })), {
      x: 5.2,
      y: 1.4,
      w: 4.3,
      h: 4,
      fontFace: this.theme.fontFamily,
      fontSize: this.theme.fontSizes.body,
      color: this.theme.colors.body,
    });
    if (content.speakerNotes) slide.addNotes(content.speakerNotes);
  }

  private renderQuoteSlide(slide: PptxGenJS.Slide, content: SlideContent): void {
    slide.addText(content.body.join(" "), {
      x: 1,
      y: 2,
      w: 8,
      h: 2,
      fontFace: this.theme.fontFamily,
      fontSize: this.theme.fontSizes.heading,
      italic: true,
      align: "center",
      color: this.theme.colors.heading,
    });
    if (content.speakerNotes) slide.addNotes(content.speakerNotes);
  }

  private renderClosingSlide(slide: PptxGenJS.Slide, content: SlideContent): void {
    slide.addText(content.heading, {
      x: 0.5,
      y: 2.5,
      w: 9,
      h: 1,
      fontFace: this.theme.fontFamily,
      fontSize: this.theme.fontSizes.title,
      color: this.theme.colors.accent,
      bold: true,
      align: "center",
    });
    if (content.speakerNotes) slide.addNotes(content.speakerNotes);
  }
}
