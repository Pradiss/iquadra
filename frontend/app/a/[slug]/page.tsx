"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { useParams, useRouter } from "next/navigation";
import { MapPin, Search } from "lucide-react";

import { getUsuario } from "@/lib/auth-storage";
import { getRedirectAfterAuth } from "@/lib/auth-flow";
import {
  AgendaFilterBar,
  agendaFiltroInicial,
  type AgendaFiltros,
} from "@/components/jogador/painel/agenda-filter-bar";
import { AgendaCalendar } from "@/components/jogador/painel/agenda-calendar";
import { AgendaList } from "@/components/jogador/painel/agenda-list";

import {
  obterDisponibilidadePublica,
  type AcademiaPublica,
  type DisponibilidadeAcademiaPublica,
  type SlotPublico,
} from "@/services/public-agenda.service";

type ParticipantePublico = {
  id?: string;
  nome: string;
  foto_perfil?: string | null;
  categoria?: string | null;
};

type QuadraPublicaAgenda = {
  id: string;
  nome: string;
  tipo_piso?: string | null;
  modalidade?: string | null;
  valor_hora?: number | null;
  coberta?: boolean | null;
  capacidade_minima?: number;
  capacidade_maxima?: number;
  permite_simples?: boolean;
  permite_dupla?: boolean;
};

type HorarioAgendaPublico = {
  id: string;
  hora: string;
  horaFim: string;
  quadraId: string;
  quadraNome: string;
  disponivel: boolean;
  motivo: "JOGO" | "AULA" | "BLOQUEADO" | null;
  capacidadeMinima: number;
  capacidadeMaxima: number;
  permiteSimples: boolean;
  permiteDupla: boolean;
  jogadoresConfirmados: number;
  vagasDisponiveis: number;
  jogo?: {
    id: string;
    tipo_jogo?: "SIMPLES" | "DUPLA";
    status?: string;
    maximo_participantes?: number;
    jogadores_confirmados?: number;
    vagas_disponiveis?: number;
    participantes: ParticipantePublico[];
  } | null;
};

const AGENDAMENTO_PENDENTE_KEY = "playfy_agendamento_pendente";

function safeStorageSet(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {}
}

function formatarLocal(academia?: AcademiaPublica | null) {
  if (!academia) return "Selecionar academia";

  const cidade = academia.cidade?.trim();
  const estado = academia.estado?.trim();
  const local = cidade && estado ? `${cidade} - ${estado}` : cidade || estado;

  return local ? `${academia.nome} • ${local}` : academia.nome;
}

function montarHorarios(agenda: DisponibilidadeAcademiaPublica) {
  const quadras = agenda.quadras.map((item, index): QuadraPublicaAgenda => {
    const quadra = item.quadra;

    return {
      id: `quadra-publica-${index}-${quadra.nome}`,
      nome: quadra.nome,
      tipo_piso: quadra.tipo_piso,
      modalidade: quadra.modalidade,
      valor_hora: quadra.valor_hora,
      coberta: quadra.coberta,
      capacidade_minima: quadra.capacidade_minima ?? 2,
      capacidade_maxima: quadra.capacidade_maxima ?? 4,
      permite_simples: quadra.permite_simples ?? true,
      permite_dupla: quadra.permite_dupla ?? true,
    };
  });

  const horarios = agenda.quadras.flatMap((item, quadraIndex) => {
    const quadra = quadras[quadraIndex];

    if (!quadra) return [];

    return item.slots.map(
      (slot: SlotPublico, slotIndex): HorarioAgendaPublico => {
        const jogo = slot.jogo;
        const participantes = jogo?.participantes ?? [];

        const capacidadeMinima = Number(
          slot.capacidade_minima ?? quadra.capacidade_minima ?? 2,
        );

        const capacidadeMaxima = Number(
          slot.capacidade_maxima ?? quadra.capacidade_maxima ?? 4,
        );

        const jogadoresConfirmados = Number(
          slot.jogadores_confirmados ??
            jogo?.jogadores_confirmados ??
            participantes.length,
        );

        const maximoParticipantes =
          jogo?.maximo_participantes ?? capacidadeMaxima;

        return {
          id: `slot-publico-${quadra.id}-${slot.inicio}-${slot.fim}-${slotIndex}`,
          hora: slot.inicio,
          horaFim: slot.fim,
          quadraId: quadra.id,
          quadraNome: quadra.nome,
          disponivel: slot.disponivel,
          motivo: slot.motivo,
          capacidadeMinima,
          capacidadeMaxima,
          permiteSimples: Boolean(
            slot.permite_simples ?? quadra.permite_simples,
          ),
          permiteDupla: Boolean(slot.permite_dupla ?? quadra.permite_dupla),
          jogadoresConfirmados,
          vagasDisponiveis: Number(
            slot.vagas_disponiveis ??
              jogo?.vagas_disponiveis ??
              Math.max(maximoParticipantes - jogadoresConfirmados, 0),
          ),
          jogo: jogo
            ? {
                id: `slot-publico-${quadra.id}-${slot.inicio}-${slot.fim}-${slotIndex}`,
                tipo_jogo: jogo.tipo_jogo,
                status: jogo.status,
                maximo_participantes: jogo.maximo_participantes,
                jogadores_confirmados: jogo.jogadores_confirmados,
                vagas_disponiveis: jogo.vagas_disponiveis,
                participantes,
              }
            : null,
        };
      },
    );
  });

  return { quadras, horarios };
}

export default function AcademiaPublicaPage() {
  const params = useParams<{ slug?: string }>();
  const router = useRouter();

  const slug = params.slug ?? "";

  const [verificandoSessao, setVerificandoSessao] = useState(true);
  const [agenda, setAgenda] = useState<DisponibilidadeAcademiaPublica | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [dataSelecionada, setDataSelecionada] = useState(
    format(new Date(), "yyyy-MM-dd"),
  );
  const [filtrosQuadra, setFiltrosQuadra] =
    useState<AgendaFiltros>(agendaFiltroInicial);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const usuario = getUsuario();

      if (usuario) {
        router.replace(getRedirectAfterAuth(usuario));
        return;
      }

      setVerificandoSessao(false);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [router]);

  useEffect(() => {
    if (verificandoSessao || !slug || !dataSelecionada) return;

    let ativo = true;

    async function carregarAgenda() {
      setLoading(true);
      setErro("");

      try {
        const data = await obterDisponibilidadePublica(slug, dataSelecionada);

        if (!ativo) return;

        setAgenda(data);
      } catch {
        if (!ativo) return;

        setAgenda(null);
        setErro("Não foi possível carregar os horários agora.");
      } finally {
        if (ativo) {
          setLoading(false);
        }
      }
    }

    void carregarAgenda();

    return () => {
      ativo = false;
    };
  }, [slug, dataSelecionada, verificandoSessao]);

  const { quadras, horarios } = useMemo(() => {
    if (!agenda) {
      return { quadras: [], horarios: [] };
    }

    return montarHorarios(agenda);
  }, [agenda]);

  const quadrasFiltradas = useMemo(() => {
    return quadras.filter((quadra) => {
      const valorHora = quadra.valor_hora ?? null;

      return (
        (filtrosQuadra.piso === "TODOS" ||
          quadra.tipo_piso === filtrosQuadra.piso) &&
        (filtrosQuadra.cobertura === "TODAS" ||
          (filtrosQuadra.cobertura === "COBERTA" && quadra.coberta) ||
          (filtrosQuadra.cobertura === "DESCOBERTA" && !quadra.coberta)) &&
        (filtrosQuadra.jogadores === "TODOS" ||
          (filtrosQuadra.jogadores === "2" && quadra.permite_simples) ||
          (filtrosQuadra.jogadores === "4" && quadra.permite_dupla)) &&
        (filtrosQuadra.modalidade === "TODAS" ||
          quadra.modalidade === filtrosQuadra.modalidade) &&
        (filtrosQuadra.preco === "TODOS" ||
          (valorHora !== null &&
            ((filtrosQuadra.preco === "ATE_50" && valorHora <= 50) ||
              (filtrosQuadra.preco === "50_100" &&
                valorHora > 50 &&
                valorHora <= 100) ||
              (filtrosQuadra.preco === "ACIMA_100" && valorHora > 100))))
      );
    });
  }, [quadras, filtrosQuadra]);

  const horariosFiltrados = useMemo(() => {
    if (quadrasFiltradas.length === 0) return [];

    const idsPermitidos = new Set(quadrasFiltradas.map((quadra) => quadra.id));

    return horarios
      .filter((horario) => idsPermitidos.has(horario.quadraId))
      .sort((a, b) => {
        const porHora = a.hora.localeCompare(b.hora);

        if (porHora !== 0) return porHora;

        return a.quadraNome.localeCompare(b.quadraNome);
      });
  }, [horarios, quadrasFiltradas]);

  function escolherHorario(horario: HorarioAgendaPublico) {
    safeStorageSet(
      AGENDAMENTO_PENDENTE_KEY,
      JSON.stringify({
        slug,
        data: dataSelecionada,
        hora: horario.hora,
        fim: horario.horaFim,
        quadraNome: horario.quadraNome,
      }),
    );

    router.push(
      `/login?redirect=${encodeURIComponent(`/a/${slug}?agendar=1`)}`,
    );
  }

  if (verificandoSessao) {
    return (
      <main className="min-h-screen bg-[#F3F0E8] px-4 py-6">
        <p className="text-sm text-zinc-500">Carregando...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F3F0E8] px-4 py-6 pb-28 sm:px-6 lg:px-12 lg:py-8">
      <section>
        <div className="mb-2">
          <button
            type="button"
            className="flex h-12 w-full items-center gap-3 rounded-[30px] border border-zinc-200 bg-white px-5 text-left shadow-sm transition hover:border-zinc-300"
          >
            <MapPin className="h-6 w-6 shrink-0 text-green-700" />

            <span className="min-w-0 flex-1 truncate text-[15px] font-medium text-zinc-950 sm:text-lg">
              {formatarLocal(agenda?.academia)}
            </span>

            <Search className="h-6 w-6 shrink-0 text-green-700" />
          </button>

          <div className="mt-4">
            <AgendaFilterBar
              filtros={filtrosQuadra}
              onChange={setFiltrosQuadra}
            />
          </div>
        </div>

        <section>
          <AgendaCalendar
            dataSelecionada={dataSelecionada}
            onSelectData={setDataSelecionada}
          />

          {erro && (
            <p className="mb-3 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-600">
              {erro}
            </p>
          )}

          {loading ? (
            <p className="text-sm text-zinc-500">Carregando agenda...</p>
          ) : horariosFiltrados.length === 0 ? (
            <p className="rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-500">
              Nenhum horário encontrado para os filtros selecionados.
            </p>
          ) : (
            <AgendaList
              horarios={horariosFiltrados}
              onSelect={escolherHorario}
            />
          )}
        </section>
      </section>
    </main>
  );
}
