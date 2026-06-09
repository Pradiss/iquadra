import Link from "next/link"

export function LessonsSection() {
  return (
    <section id="aulas" className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-2">
      <div>
        <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-black text-green-700">
          Professores e aulas
        </span>

        <h2 className="mt-6 text-4xl font-black leading-tight text-zinc-950">
          Professores também entram na mesma plataforma.
        </h2>

        <p className="mt-5 text-lg leading-8 text-zinc-600">
          O professor cria sua conta, a academia vincula o perfil e passa a
          organizar aulas, alunos e horários dentro do IQuadra.
        </p>

        <Link
          href="/cadastro-professor"
          className="mt-8 inline-flex rounded-full border border-zinc-300 bg-white px-7 py-4 font-bold text-zinc-800 hover:bg-zinc-50"
        >
          Criar conta de professor
        </Link>
      </div>

      <div className="rounded-[2rem] bg-white p-8 shadow-xl">
        <div className="space-y-5">
          <Card title="Aulas individuais" text="Organize horários de professor e aluno." />
          <Card title="Aulas recorrentes" text="Repita aulas semanalmente em dias específicos." />
          <Card title="Agenda integrada" text="Aulas ocupam a quadra e evitam conflitos." />
        </div>
      </div>
    </section>
  )
}

function Card({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl bg-[#f8f6ef] p-5">
      <h3 className="text-xl font-black text-zinc-950">{title}</h3>
      <p className="mt-2 leading-7 text-zinc-600">{text}</p>
    </div>
  )
}