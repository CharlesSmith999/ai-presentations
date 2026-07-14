import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ConsultationResponseDto } from "@/features/presentation-consulting/application/dto/consultation.dto";

const STATUS_LABEL: Record<string, string> = {
  gathering_requirements: "Draft",
  outline_ready: "Outline ready",
  presentation_generated: "Deck generated",
  archived: "Archived",
};

export function ConsultationListItem({ consultation }: { consultation: ConsultationResponseDto }): React.ReactElement {
  return (
    <Link href={`/dashboard/consultations/${consultation.id}`}>
      <Card className="transition-colors hover:bg-accent/50">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="line-clamp-1">{consultation.goal}</CardTitle>
            <Badge variant="secondary">{STATUS_LABEL[consultation.status] ?? consultation.status}</Badge>
          </div>
          <CardDescription className="line-clamp-1">{consultation.audienceDescription}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
