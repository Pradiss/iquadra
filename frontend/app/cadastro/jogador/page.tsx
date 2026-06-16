import FormCadastroJogador from "@/components/auth/FormCadastroJogador";

export default function CadastroJogadorPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f4f1e8] px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#c7f9cc_0,transparent_32%),radial-gradient(circle_at_bottom_right,#d9f99d_0,transparent_28%)]" />

      <div className="relative z-10 w-full max-w-[420px]">
        <FormCadastroJogador />
      </div>
    </main>
  );
}