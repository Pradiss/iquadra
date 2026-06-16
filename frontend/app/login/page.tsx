import Image from "next/image";
import { Suspense } from "react";
import FormLogin from "@/components/auth/FormLogin";

export default async function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f4f1e8] px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#c7f9cc_0,transparent_32%),radial-gradient(circle_at_bottom_right,#d9f99d_0,transparent_28%)]" />

      <section className="relative z-10 grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1fr_440px]">
        <div className="hidden lg:block">
          <Image
            src="/logo.png"
            alt="IQuadra"
            width={148}
            height={40}
            className="mb-8 h-10 w-auto"
          />

          <span className="inline-flex rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-700">
            IQuadra
          </span>

          <h1 className="mt-6 max-w-xl text-5xl font-bold leading-[1.12] tracking-[-0.035em] text-zinc-950">
            Reserve quadras, entre em jogos e acompanhe sua academia.
          </h1>

          <p className="mt-5 max-w-lg text-lg leading-8 text-zinc-600">
            Uma plataforma simples para jogadores, professores e academias
            organizarem horários, jogos e aulas em um só lugar.
          </p>
        </div>

        <Suspense fallback={null}>
          <FormLogin />
        </Suspense>
      </section>
    </main>
  );
}
