import { Button } from "@/components/ui/button";

export default function HomePage(): React.ReactElement {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-4 px-6 py-24">
      <h1 className="text-3xl font-semibold tracking-tight">AI Presentation Consultant</h1>
      <p className="text-muted-foreground">
        Not a slide generator — a strategist. Tell it what you need to persuade someone of, and it
        will build the argument, the narrative, and only then, the deck.
      </p>
      <a href="/dashboard/consultations">
        <Button className="w-fit">Open the portal</Button>
      </a>
    </main>
  );
}
