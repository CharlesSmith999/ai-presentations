import { NewConsultationForm } from "@/features/presentation-consulting/presentation/components/new-consultation-form";

export default function NewConsultationPage(): React.ReactElement {
  return (
    <main className="mx-auto flex max-w-xl flex-col gap-6 px-6 py-16">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New consultation</h1>
        <p className="text-sm text-muted-foreground">
          Tell it what the presentation needs to accomplish. The narrative strategy comes first —
          slides come last.
        </p>
      </div>
      <NewConsultationForm />
    </main>
  );
}
