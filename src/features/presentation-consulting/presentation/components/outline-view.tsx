import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ConsultationOutline } from "@/ai/schemas/consultation-outline.schema";

export function OutlineView({ outline }: { outline: ConsultationOutline }): React.ReactElement {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle>Thesis</CardTitle>
            <Badge variant="outline">{outline.recommendedTone}</Badge>
          </div>
          <CardDescription>{outline.thesis}</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Audience</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 pt-0 text-sm">
          <p>{outline.audience.description}</p>
          <div>
            <p className="font-medium">Primary concerns</p>
            <ul className="list-inside list-disc text-muted-foreground">
              {outline.audience.primaryConcerns.map((concern) => (
                <li key={concern}>{concern}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-medium">Decision criteria</p>
            <ul className="list-inside list-disc text-muted-foreground">
              {outline.audience.decisionCriteria.map((criterion) => (
                <li key={criterion}>{criterion}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-muted-foreground">Narrative arc</h3>
        {outline.narrativeArc.map((section, index) => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle className="text-base">
                {index + 1}. {section.title}
              </CardTitle>
              <CardDescription>{section.keyMessage}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 text-sm">
              <ul className="list-inside list-disc text-muted-foreground">
                {section.supportingPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {outline.risks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Anticipated objections</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm">
            <ul className="list-inside list-disc text-muted-foreground">
              {outline.risks.map((risk) => (
                <li key={risk}>{risk}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
