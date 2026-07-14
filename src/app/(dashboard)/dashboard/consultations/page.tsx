import Link from "next/link";
import { requireCurrentUserId } from "@/lib/auth/current-user";
import { getContainer } from "@/di/container";
import { Button } from "@/components/ui/button";
import { ConsultationListItem } from "@/features/presentation-consulting/presentation/components/consultation-list-item";

export default async function ConsultationsPage(): Promise<React.ReactElement> {
  const userId = await requireCurrentUserId();
  const { items } = await getContainer().consultationService.listForOwner(userId, 1);

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-16">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Consultations</h1>
          <p className="text-sm text-muted-foreground">
            Each one starts with a strategy, not a slide.
          </p>
        </div>
        <Link href="/dashboard/consultations/new">
          <Button>New consultation</Button>
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No consultations yet. Start one to get an AI-built narrative strategy for your next
          presentation.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((consultation) => (
            <ConsultationListItem key={consultation.id} consultation={consultation} />
          ))}
        </div>
      )}
    </main>
  );
}
