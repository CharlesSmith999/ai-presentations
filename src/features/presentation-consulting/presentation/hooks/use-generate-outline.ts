"use client";

import { useState, useCallback } from "react";
import { generateOutlineAction } from "@/features/presentation-consulting/presentation/actions/generate-outline.action";
import type { ConsultationOutline } from "@/ai/schemas/consultation-outline.schema";

interface UseGenerateOutlineResult {
  generate: () => Promise<void>;
  isGenerating: boolean;
  error: string | null;
  outline: ConsultationOutline | null;
}

/**
 * Reusable hook so any screen that needs "trigger outline generation,
 * show a spinner, surface an error" can reuse it instead of
 * re-implementing the state machine.
 */
export function useGenerateOutline(consultationId: string, initialOutline: ConsultationOutline | null): UseGenerateOutlineResult {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outline, setOutline] = useState<ConsultationOutline | null>(initialOutline);

  const generate = useCallback(async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const result = await generateOutlineAction(consultationId);
      setOutline(result.outline);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate the outline");
    } finally {
      setIsGenerating(false);
    }
  }, [consultationId]);

  return { generate, isGenerating, error, outline };
}
