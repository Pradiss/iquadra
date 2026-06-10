import { CadastroEmpresaForm } from "@/features/auth/components"

export default function CadastroEmpresaPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f4f1e8] px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#c7f9cc_0,transparent_32%),radial-gradient(circle_at_bottom_right,#d9f99d_0,transparent_28%)]" />

      <section className="relative z-10 grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1fr_460px]">
        <div className="hidden lg:block">
          <span className="inline-flex rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-700">
            Academia
          </span>

          <h1 className="mt-6 max-w-xl text-5xl font-black leading-tight tracking-tight text-zinc-950">
            Coloque sua academia dentro do IQuadra.
          </h1>

          <p className="mt-5 max-w-lg text-lg leading-8 text-zinc-600">
            Cadastre seu estabelecimento para gerenciar quadras, horários,
            bloqueios, aulas, professores e jogos em uma única plataforma.
          </p>
        </div>

        <CadastroEmpresaForm />
      </section>
    </main>
  )
}
