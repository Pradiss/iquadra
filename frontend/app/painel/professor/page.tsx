import { ProfessorGuard } from "@/components/painel/guards/PainelRoleGuard";

export default function PainelProfessorPage() {
  return (
    <ProfessorGuard>
      <main className="flex min-h-screen items-center justify-center bg-[#f4f1e8] px-4">
        <section className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-green-700">Professor</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-zinc-950">
            Painel do professor
          </h1>
          <p className="mt-3 text-sm leading-6 text-zinc-500">
            O painel do professor esta em construcao.
          </p>
        </section>
      </main>
    </ProfessorGuard>
  );
}
