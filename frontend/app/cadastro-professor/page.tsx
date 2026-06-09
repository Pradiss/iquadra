import { CadastroProfessorForm } from "../../components/forms/cadastro-professor-form"

export default function CadastroProfessorPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f4f1e8] px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#c7f9cc_0,transparent_32%),radial-gradient(circle_at_bottom_right,#d9f99d_0,transparent_28%)]" />

      <section className="relative z-10 grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1fr_440px]">
        <div className="hidden lg:block">
          <span className="inline-flex rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-700">
            Professor
          </span>

          <h1 className="mt-6 max-w-xl text-5xl font-black leading-tight tracking-tight text-zinc-950">
            De aulas e acompanhe sua agenda.
          </h1>

          <p className="mt-5 max-w-lg text-lg leading-8 text-zinc-600">
            Crie sua conta como professor. Depois, a academia podera vincular
            seu e-mail no painel admin para liberar aulas, horarios e alunos.
          </p>
        </div>

        <CadastroProfessorForm />
      </section>
    </main>
  )
}
