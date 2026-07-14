"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createConsultationAction } from "@/features/presentation-consulting/presentation/actions/create-consultation.action";

/**
 * The one form that starts every consultation. Deliberately collects
 * strategy inputs (goal, audience, context, constraints) — not slide
 * counts or design preferences — because those are exactly the inputs
 * the AI layer's outline prompt consumes.
 */
export function NewConsultationForm(): React.ReactElement {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData): Promise<void> {
    setIsSubmitting(true);
    setError(null);
    try {
      const consultation = await createConsultationAction({
        goal: String(formData.get("goal") ?? ""),
        audienceDescription: String(formData.get("audienceDescription") ?? ""),
        context: String(formData.get("context") ?? ""),
        constraints: String(formData.get("constraints") ?? ""),
      });
      router.push(`/dashboard/consultations/${consultation.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create the consultation");
      setIsSubmitting(false);
    }
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="goal">What does this presentation need to achieve?</Label>
        <Textarea
          id="goal"
          name="goal"
          required
          minLength={10}
          placeholder="Convince the board to approve a 20% increase in the engineering budget for Q3"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="audienceDescription">Who is the audience?</Label>
        <Input
          id="audienceDescription"
          name="audienceDescription"
          required
          placeholder="Board of directors, mostly finance-oriented, skeptical of headcount growth"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="context">Relevant background/context</Label>
        <Textarea
          id="context"
          name="context"
          required
          placeholder="We missed two release deadlines last quarter due to understaffing on the platform team..."
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="constraints">Constraints (one per line, optional)</Label>
        <Textarea id="constraints" name="constraints" placeholder={"Must fit in a 15-minute slot\nNo confidential financials"} />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={isSubmitting} className="w-fit">
        {isSubmitting ? "Creating..." : "Start consultation"}
      </Button>
    </form>
  );
}
