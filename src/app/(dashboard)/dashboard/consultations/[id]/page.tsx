import { notFound } from "next/navigation";
import { requireCurrentUserId } from "@/lib/auth/current-user";
import { getContainer } from "@/di/container";
import { Badge } from "@/components/ui/badge";
import { ConsultationWorkflow } from "@/features/presentation-consulting/presentation/components/consultation-workflow";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ConsultationDetailPage({ params }: PageProps): Promise<React.ReactElement> {
  await requireCurrentUserId();
  const { id } = await params;

  const consultation = await getContainer().consultationService.getById(id);

  if (!consultation) {
    notFound();
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-16">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{consultation.goal}</h1>
          <Badge variant="secondary">{consultation.status}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{consultation.audienceDescription}</p>
      </div>

      <ConsultationWorkflow consultationId={consultation.id} initialOutline={consultation.outline} />
    </main>
  );
}
