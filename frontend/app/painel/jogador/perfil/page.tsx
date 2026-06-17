"use client";

import { useEffect, useState } from "react";
import { LogOut, Settings, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";

import api from "@/services/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { clearAuthStorage, getUsuario } from "@/lib/auth-storage";
import { getSafeImageUrl } from "@/lib/safe-image";

type Usuario = {
  id: string;
  nome: string;
  email: string;
  telefone?: string | null;
  foto_perfil?: string | null;
  status?: string;
  perfil_cliente?: {
    categoria?: string;
    cidade?: string;
    cep?: string;
  } | null;
};

type Jogo = {
  id: string;
  status?: string;
  data?: string;
  inicio_em?: string;
  criado_por_usuario_id?: string;
  responsavel_usuario_id?: string;
  participantes?: {
    usuario_id?: string;
    usuario?: {
      id?: string;
    };
  }[];
};

function getData<T>(response: { data: unknown }): T {
  const data = response.data as { data?: T; user?: T };
  return data.data ?? data.user ?? (response.data as T);
}

function getInitials(nome?: string) {
  if (!nome) return "IQ";

  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join("");
}

function formatCategoria(categoria?: string) {
  if (!categoria) return "Iniciante";
  if (categoria === "INICIANTE") return "Iniciante";

  return categoria;
}

function isUsuarioNoJogo(jogo: Jogo, usuarioId: string) {
  return (
    jogo.criado_por_usuario_id === usuarioId ||
    jogo.responsavel_usuario_id === usuarioId ||
    jogo.participantes?.some(
      (participante) =>
        participante.usuario_id === usuarioId ||
        participante.usuario?.id === usuarioId,
    )
  );
}

function isJogoCompleto(jogo: Jogo) {
  const status = String((jogo as Jogo & { status?: string }).status ?? "")
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return (
    status === "CONCLUIDO" ||
    status === "COMPLETO" ||
    status === "FINALIZADO" ||
    status === "FINISHED"
  );
}

export default function PerfilPage() {
  const router = useRouter();

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [totalJogos, setTotalJogos] = useState(0);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarPerfil() {
      const usuarioSalvo = getUsuario() as Usuario | null;

      if (usuarioSalvo) {
        setUsuario(usuarioSalvo);
      }

      try {
        const [userResponse, jogosResponse] = await Promise.all([
          api.get("/users/me"),
          api.get("/jogos"),
        ]);

        const user = getData<Usuario>(userResponse);
        const jogos = getData<Jogo[]>(jogosResponse);

        const jogosUsuario = Array.isArray(jogos)
          ? jogos.filter(
              (jogo) => isUsuarioNoJogo(jogo, user.id) && isJogoCompleto(jogo),
            )
          : [];

        setUsuario(user);
        setTotalJogos(jogosUsuario.length);

        localStorage.setItem("usuario", JSON.stringify(user));
      } catch {
        setErro("Não foi possível carregar todas as informações do perfil.");
      } finally {
        setLoading(false);
      }
    }

    void carregarPerfil();
  }, []);

  function sair() {
    clearAuthStorage();
    router.push("/login");
  }

  const fotoPerfil = getSafeImageUrl(usuario?.foto_perfil);

  return (
    <>
      <section className="mx-auto max-w-xl rounded-[32px] bg-white p-6 text-center shadow-sm sm:p-8">
        <Avatar className="mx-auto h-40 w-40 overflow-hidden rounded-full border-4 border-white bg-green-100 shadow-[0_18px_50px_rgba(15,23,42,0.18)]">
          {fotoPerfil && (
            <AvatarImage
              src={fotoPerfil}
              alt={usuario?.nome ?? "Jogador"}
              className="h-full w-full rounded-full object-cover"
            />
          )}

          <AvatarFallback className="h-full w-full rounded-full bg-green-100 text-4xl font-black text-green-800">
            {getInitials(usuario?.nome)}
          </AvatarFallback>
        </Avatar>

        <h1 className="mt-5 text-2xl font-black text-zinc-950">
          {usuario?.nome ?? "Jogador"}
        </h1>

        <p className="mt-1 text-sm text-zinc-500">
          {loading ? "Carregando informações..." : usuario?.email}
        </p>

        <div className="mt-4 flex justify-center gap-2">
          {usuario?.perfil_cliente?.cidade && (
            <Badge variant="outline" className="rounded-full px-4 py-1.5">
              {usuario.perfil_cliente.cidade}
            </Badge>
          )}
        </div>

        {erro && (
          <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            {erro}
          </p>
        )}

        <div className="mt-8 grid grid-cols-2 gap-3">
          <div className="rounded-[30px] bg-zinc-100 p-5">
            <Trophy className="mx-auto h-6 w-6 text-green-700" />

            <p className="mt-3 text-2xl font-black text-zinc-950">
              {totalJogos}
            </p>

            <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
              Jogos
            </p>
          </div>

          <div className="rounded-[30px] bg-zinc-100 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
              Ranking
            </p>

            <p className="mt-3 text-3xl font-black text-green-700">
              {formatCategoria(usuario?.perfil_cliente?.categoria)}
            </p>

            <p className="mt-1 text-xs font-semibold text-zinc-400">
              Categoria atual
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <Button
            type="button"
            variant="outline"
            className="h-[50px] w-full rounded-2xl font-bold"
            onClick={() => router.push("/painel/jogador/configuracoes")}
          >
            <Settings className="mr-2 h-4 w-4" />
            Configurações
          </Button>

          <Button
            type="button"
            onClick={sair}
            className="h-[50px] w-full rounded-2xl bg-red-50 font-bold text-red-600 hover:bg-red-100"
            variant="ghost"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair da conta
          </Button>
        </div>
      </section>
    </>
  );
}
