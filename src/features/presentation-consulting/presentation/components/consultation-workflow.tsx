"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useGenerateOutline } from "@/features/presentation-consulting/presentation/hooks/use-generate-outline";
import { OutlineView } from "@/features/presentation-consulting/presentation/components/outline-view";
import { generatePresentationAction } from "@/features/presentation-consulting/presentation/actions/generate-presentation.action";
import type { ConsultationOutline } from "@/ai/schemas/consultation-outline.schema";

interface ConsultationWorkflowProps {
  consultationId: string;
  initialOutline: ConsultationOutline | null;
}

/**
 * The core portal interaction, mirroring the architecture exactly:
 *   1. "Generate outline" calls the AI layer (via the outline server action).
 *   2. Once an outline exists, "Generate presentation" calls
 *      presentation-engine -> renderer -> storage (via the presentation
 *      server action) and returns a signed download link.
 * This component only orchestrates UI state; all real logic lives in
 * the server actions / use-cases it calls.
 */
export function ConsultationWorkflow({ consultationId, initialOutline }: ConsultationWorkflowProps): React.ReactElement {
  const { generate, isGenerating, error, outline } = useGenerateOutline(consultationId, initialOutline);
  const [isRendering, setIsRendering] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  async function handleGeneratePresentation(): Promise<void> {
    setIsRendering(true);
    setRenderError(null);
    try {
      const result = await generatePresentationAction(consultationId);
      setDownloadUrl(result.downloadUrl);
    } catch (err) {
      setRenderError(err instanceof Error ? err.message : "Failed to generate the presentation");
    } finally {
      setIsRendering(false);
    }
  }

  if (!outline) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          No strategic outline yet. Generating one asks the AI layer to analyze the goal, audience, and
          context you provided and produce a narrative strategy — not slides.
        </p>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button onClick={generate} disabled={isGenerating} className="w-fit">
          {isGenerating ? "Generating outline..." : "Generate outline"}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <OutlineView outline={outline} />

      <div className="flex flex-col gap-2 border-t pt-4">
        {renderError && <p className="text-sm text-destructive">{renderError}</p>}
        {downloadUrl ? (
          <a href={downloadUrl} className="w-fit">
            <Button>Download presentation (.pptx)</Button>
          </a>
        ) : (
          <Button onClick={handleGeneratePresentation} disabled={isRendering} className="w-fit">
            {isRendering ? "Rendering deck..." : "Generate presentation"}
          </Button>
        )}
      </div>
    </div>
  );
}
