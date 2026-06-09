"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Search, Trophy, UserRoundPlus } from "lucide-react";

import { clearAuthStorage, getSession, getToken } from "../../lib/auth-storage";
import {
  formatDateTime,
  formatPeriodo,
  getErrorMessage,
  getFirstName,
  isUnauthorizedError,
  sortAcademiasByPreference,
} from "../../lib/painel-format";
import { getPerfilLabel, getUserExperience } from "../../lib/perfis";
import { listarAmizades } from "../../services/amizade.service";
import { listarConvitesJogo } from "../../services/convite-jogo.service";
import { listarEmpresas } from "../../services/empresa.service";
import { listarMeusJogos } from "../../services/jogo.service";

import type { AuthSessionSnapshot } from "../../types/auth";
import type { EmpresaMarketplace } from "../../types/empresa";
import type { JogoDetalhado } from "../../types/agenda";
import type { Amizade, ConviteJogo } from "../../types/social";

import { AcademiasExplorer } from "./academias-explorer";

export function PainelHomeBoard() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [session, setSession] = useState<AuthSessionSnapshot | null>(null);

  const [academias, setAcademias] = useState<EmpresaMarketplace[]>([]);
  const [meusJogos, setMeusJogos] = useState<JogoDetalhado[]>([]);
  const [convites, setConvites] = useState<ConviteJogo[]>([]);
  const [amizades, setAmizades] = useState<Amizade[]>([]);

  useEffect(() => {
    async function loadPainel() {
      const token = getToken();
      const currentSession = getSession();

      if (!token || !currentSession) {
        clearAuthStorage();
        router.replace("/login");
        return;
      }

      setSession(currentSession);

      try {
        const [
          empresasResponse,
          jogosResponse,
          convitesResponse,
          amizadesResponse,
        ] = await Promise.all([
          listarEmpresas(),
          listarMeusJogos(currentSession.usuario.id),
          listarConvitesJogo(),
          listarAmizades(),
        ]);

        setAcademias(empresasResponse.empresas);
        setMeusJogos(jogosResponse.jogos);
        setConvites(convitesResponse.convites);
        setAmizades(amizadesResponse.amizades);
      } catch (requestError) {
        if (isUnauthorizedError(requestError)) {
          clearAuthStorage();
          router.replace("/login");
          return;
        }

        setError(
          getErrorMessage(
            requestError,
            "Nao foi possivel carregar o painel agora.",
          ),
        );
      } finally {
        setLoading(false);
      }
    }

    void loadPainel();
  }, [router]);

  const academiasOrdenadas = useMemo(
    () => sortAcademiasByPreference(academias, session?.usuario.cidade),
    [academias, session?.usuario.cidade],
  );

  const jogosFuturos = meusJogos
    .filter((jogo) => new Date(jogo.fim_em) >= new Date())
    .slice(0, 3);

  const convitesPendentes = convites.filter(
    (convite) => convite.status === "PENDENTE",
  );
  const amigosAceitos = amizades.filter(
    (amizade) => amizade.status === "ACEITA",
  );
  const experience = getUserExperience(session?.perfilAtual);

  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-3xl bg-white p-5 text-sm font-bold text-zinc-500">
        <LoaderCircle className="h-4 w-4 animate-spin" />
        Carregando painel
      </div>
    );
  }

  return (
    <main className=" px-4 py-6 sm:px-6 space-y-6">
      <section className="">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-green-700">
          {getPerfilLabel(session?.perfilAtual)}
        </p>

        <h1 className="mt-3 text-3xl font-black text-zinc-950">
          Olá, {getFirstName(session?.usuario.nome)}
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          Escolha uma academia, veja as quadras disponíveis e marque seu jogo.
        </p>

        {error && (
          <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        <div className="mt-5 grid gap-4 sm:grid-cols-4">
          <Link
            href="/painel/buscar"
            className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-green-700 text-sm font-black text-white"
          >
            <Search className="h-5 w-5" />
            Buscar quadra
          </Link>

          <Link
            href="/painel/meus-jogos"
            className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white text-sm font-black text-zinc-700"
          >
            <Trophy className="h-5 w-5" />
            Meus jogos
          </Link>
        </div>
      </section>

      <AcademiasExplorer
        academias={academiasOrdenadas}
        title="Academias próximas"
        description="Escolha uma academia para ver quadras e horários."
        limit={4}
        linkHref="/painel/buscar"
        linkLabel="Buscar mais quadras"
        showSearch={false}
      />
    </main>
  );
}
