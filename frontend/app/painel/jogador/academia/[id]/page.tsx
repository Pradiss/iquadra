"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { useParams, useRouter } from "next/navigation";
import { MapPin, Search, X } from "lucide-react";

import {
  QuadraFilter,
  type QuadraFiltros,
} from "@/components/jogador/painel/filter";
import { Button } from "@/components/ui/button";
import { AgendaList } from "@/components/jogador/painel/agenda-list";
import { AgendarJogoDialog } from "@/components/jogador/painel/agendar-jogo-dialog";
import { AgendaCalendar } from "@/components/jogador/painel/agenda-calendar";
import { AcademiaSearch } from "@/components/jogador/painel/academia-search";

import {
  listarAcademias,
  listarQuadrasDaAcademia,
  obterDisponibilidadeQuadra,
} from "@/services/jogador.service";
import api from "@/services/api";
import { salvarUltimaAcademia } from "@/lib/last-academia";

type Academia = {
  id: string;
  nome: string;
  cidade?: string;
  estado?: string;
};

type Quadra = {
  id: string;
  nome: string;
  tipo_piso?: string | null;
  coberta?: boolean | null;
  capacidade_minima?: number;
  capacidade_maxima?: number;
  permite_simples?: boolean;
  permite_dupla?: boolean;
};

type Participante = {
  id: string;
  nome: string;
  foto_perfil?: string | null;
  categoria?: string | null;
};

type HorarioAgenda = {
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
    criador_usuario_id?: string;
    tipo_jogo?: "SIMPLES" | "DUPLA";
    status?: string;
    maximo_participantes?: number;
    jogadores_confirmados?: number;
    vagas_disponiveis?: number;
    observacoes?: string | null;
    participantes: Participante[];
  } | null;
};

type HorarioSelecionado = {
  id: string;
  hora: string;
  fim?: string;
  quadraId: string;
  quadraNome: string;
  capacidadeMaxima: number;
  permiteSimples: boolean;
  permiteDupla: boolean;
  jogoId?: string;
  criadorUsuarioId?: string;
  status?: string;
  tipoJogo?: "SIMPLES" | "DUPLA";
  maximoParticipantes?: number;
  jogadoresConfirmados?: number;
  vagasDisponiveis?: number;
  participantes?: Participante[];
};

type SlotDisponibilidade = {
  inicio: string;
  fim: string;
  disponivel: boolean;
  motivo: "JOGO" | "AULA" | "BLOQUEADO" | null;
  capacidade_minima?: number;
  capacidade_maxima?: number;
  permite_simples?: boolean;
  permite_dupla?: boolean;
  jogadores_confirmados?: number;
  vagas_disponiveis?: number;
  jogo?: {
    id: string;
    criador_usuario_id?: string;
    tipo_jogo?: "SIMPLES" | "DUPLA";
    status?: string;
    maximo_participantes?: number;
    jogadores_confirmados?: number;
    vagas_disponiveis?: number;
    observacoes?: string | null;
    participantes?: Participante[];
  } | null;
};

type DisponibilidadeResponse = {
  quadra?: {
    capacidade_minima?: number;
    capacidade_maxima?: number;
    permite_simples?: boolean;
    permite_dupla?: boolean;
  };
  slots?: SlotDisponibilidade[];
};

function montarHorariosDaQuadra(
  quadra: Quadra,
  response: DisponibilidadeResponse
): HorarioAgenda[] {
  const slots = Array.isArray(response.slots) ? response.slots : [];

  return slots.map((slot): HorarioAgenda => {
    const participantes = slot.jogo?.participantes ?? [];

    const capacidadeMinima = Number(
      slot.capacidade_minima ??
        response.quadra?.capacidade_minima ??
        quadra.capacidade_minima ??
        2
    );

    const capacidadeMaxima = Number(
      slot.capacidade_maxima ??
        response.quadra?.capacidade_maxima ??
        quadra.capacidade_maxima ??
        4
    );

    const jogadoresConfirmados = Number(
      slot.jogadores_confirmados ??
        slot.jogo?.jogadores_confirmados ??
        participantes.length
    );

    const maximoParticipantesJogo =
      slot.jogo?.maximo_participantes ?? capacidadeMaxima;

    return {
      id: `${quadra.id}-${slot.inicio}`,
      hora: slot.inicio,
      horaFim: slot.fim,
      quadraId: quadra.id,
      quadraNome: quadra.nome,
      disponivel: slot.disponivel,
      motivo: slot.motivo,
      capacidadeMinima,
      capacidadeMaxima,
      permiteSimples: Boolean(
        slot.permite_simples ??
          response.quadra?.permite_simples ??
          quadra.permite_simples ??
          true
      ),
      permiteDupla: Boolean(
        slot.permite_dupla ??
          response.quadra?.permite_dupla ??
          quadra.permite_dupla ??
          true
      ),
      jogadoresConfirmados,
      vagasDisponiveis: Number(
        slot.vagas_disponiveis ??
          slot.jogo?.vagas_disponiveis ??
          Math.max(maximoParticipantesJogo - jogadoresConfirmados, 0)
      ),
      jogo: slot.jogo
        ? {
            ...slot.jogo,
            participantes,
          }
        : null,
    };
  });
}

export default function AcademiaAgendaPage() {
  const params = useParams<{ id?: string }>();
  const router = useRouter();
  const carregandoRef = useRef(false);

  const [busca, setBusca] = useState("");
  const [mostrarBuscaAcademias, setMostrarBuscaAcademias] = useState(false);
  const [academias, setAcademias] = useState<Academia[]>([]);

  const [academia, setAcademia] = useState<Academia | null>(null);
  const [quadras, setQuadras] = useState<Quadra[]>([]);
  const [horarios, setHorarios] = useState<HorarioAgenda[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const [filtrosQuadra, setFiltrosQuadra] = useState<QuadraFiltros>({
    tipo_piso: "TODOS",
    cobertura: "TODAS",
    jogadores: "TODOS",
  });

  const [dataSelecionada, setDataSelecionada] = useState(
    format(new Date(), "yyyy-MM-dd")
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [horarioSelecionado, setHorarioSelecionado] =
    useState<HorarioSelecionado | null>(null);

  const academiaId = academia?.id ?? params.id ?? "";

  const academiasFiltradas = useMemo(() => {
    const termo = busca.toLowerCase().trim();

    if (!termo) return [];

    return academias.filter((item) =>
      `${item.nome} ${item.cidade ?? ""} ${item.estado ?? ""}`
        .toLowerCase()
        .includes(termo)
    );
  }, [academias, busca]);

  const quadrasFiltradas = useMemo(() => {
    return quadras.filter((quadra) => {
      const filtroPiso =
        filtrosQuadra.tipo_piso === "TODOS" ||
        quadra.tipo_piso === filtrosQuadra.tipo_piso;

      const filtroCobertura =
        filtrosQuadra.cobertura === "TODAS" ||
        (filtrosQuadra.cobertura === "COBERTA" && quadra.coberta) ||
        (filtrosQuadra.cobertura === "DESCOBERTA" && !quadra.coberta);

      const filtroJogadores =
        filtrosQuadra.jogadores === "TODOS" ||
        (filtrosQuadra.jogadores === "2" && quadra.permite_simples) ||
        (filtrosQuadra.jogadores === "4" && quadra.permite_dupla);

      return filtroPiso && filtroCobertura && filtroJogadores;
    });
  }, [quadras, filtrosQuadra]);

  const horariosFiltrados = useMemo(() => {
    if (quadrasFiltradas.length === 0) return [];

    const idsPermitidos = new Set(quadrasFiltradas.map((quadra) => quadra.id));

    return horarios.filter((horario) => idsPermitidos.has(horario.quadraId));
  }, [horarios, quadrasFiltradas]);

  useEffect(() => {
    async function carregarAcademias() {
      try {
        const data = await listarAcademias();
        setAcademias(Array.isArray(data) ? data : []);
      } catch {
        setAcademias([]);
      }
    }

    void carregarAcademias();
  }, []);

  const carregarAgenda = useCallback(async () => {
    if (!academiaId || !dataSelecionada || carregandoRef.current) return;

    carregandoRef.current = true;
    setLoading(true);
    setErro("");

    try {
      const [academiaResponse, quadrasResponse] = await Promise.all([
        api.get(`/academias/${academiaId}`),
        listarQuadrasDaAcademia(academiaId),
      ]);

      const academiaApi = academiaResponse.data.data ?? academiaResponse.data;
      const quadrasApi = Array.isArray(quadrasResponse)
        ? (quadrasResponse as Quadra[])
        : [];

      salvarUltimaAcademia(academiaApi?.id ?? academiaId);
      setAcademia(academiaApi);
      setQuadras(quadrasApi);

      if (quadrasApi.length === 0) {
        setHorarios([]);
        return;
      }

      const resultados = await Promise.allSettled(
        quadrasApi.map(async (quadra) => {
          const response = (await obterDisponibilidadeQuadra(
            quadra.id,
            dataSelecionada
          )) as DisponibilidadeResponse;

          return montarHorariosDaQuadra(quadra, response);
        })
      );

      const agenda = resultados
        .filter((resultado) => resultado.status === "fulfilled")
        .flatMap((resultado) => resultado.value)
        .sort((a, b) => {
          const porHora = a.hora.localeCompare(b.hora);
          if (porHora !== 0) return porHora;

          return a.quadraNome.localeCompare(b.quadraNome);
        });

      const teveErro = resultados.some(
        (resultado) => resultado.status === "rejected"
      );

      if (teveErro) {
        setErro("Alguns horários não puderam ser carregados.");
      }

      setHorarios(agenda);
    } catch {
      setAcademia(null);
      setQuadras([]);
      setHorarios([]);
      setErro("Não foi possível carregar a agenda.");
    } finally {
      carregandoRef.current = false;
      setLoading(false);
    }
  }, [academiaId, dataSelecionada]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void carregarAgenda();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [carregarAgenda]);

  function trocarAcademia(item: Academia) {
    salvarUltimaAcademia(item.id);
    setAcademia(item);
    setMostrarBuscaAcademias(false);
    setBusca("");
    setQuadras([]);
    setHorarios([]);
    setHorarioSelecionado(null);
    setDialogOpen(false);
    setErro("");
    setFiltrosQuadra({
      tipo_piso: "TODOS",
      cobertura: "TODAS",
      jogadores: "TODOS",
    });
    router.replace(`/painel/jogador/academia/${item.id}`);
  }

  function selecionarHorario(horario: HorarioAgenda) {
    setHorarioSelecionado({
      id: horario.id,
      hora: horario.hora,
      fim: horario.horaFim,
      quadraId: horario.quadraId,
      quadraNome: horario.quadraNome,
      capacidadeMaxima: horario.capacidadeMaxima,
      permiteSimples: horario.permiteSimples,
      permiteDupla: horario.permiteDupla,
      jogoId: horario.jogo?.id,
      criadorUsuarioId: horario.jogo?.criador_usuario_id,
      status: horario.jogo?.status,
      tipoJogo: horario.jogo?.tipo_jogo,
      maximoParticipantes: horario.jogo?.maximo_participantes,
      jogadoresConfirmados: horario.jogadoresConfirmados,
      vagasDisponiveis: horario.vagasDisponiveis,
      participantes: horario.jogo?.participantes ?? [],
    });

    setDialogOpen(true);
  }

  function fecharDialog(open: boolean) {
    setDialogOpen(open);

    if (!open) {
      setHorarioSelecionado(null);
    }
  }

  return (
    <>
      <section className="max-w-5xl">
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black tracking-[-0.03em] text-black">
                {academia?.nome ?? "Agenda da academia"}
              </h1>

              {academia && (
                <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                  <MapPin className="h-3 w-3" />
                  <span>
                    {academia.cidade} - {academia.estado}
                  </span>
                </div>
              )}
            </div>

            <div className="shrink-0">
              {mostrarBuscaAcademias ? (
                <div className="relative w-[260px]">
                  <AcademiaSearch value={busca} onChange={setBusca} />

                  <button
                    type="button"
                    onClick={() => {
                      setMostrarBuscaAcademias(false);
                      setBusca("");
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setMostrarBuscaAcademias(true)}
                  className="h-8 shrink-0 gap-1 px-2 text-xs font-bold text-green-700"
                >
                  <Search className="h-3 w-3" />
                  Buscar Academias
                </Button>
              )}
            </div>
          </div>

          {mostrarBuscaAcademias && busca.trim().length > 0 && (
            <div className="mt-3 grid gap-2 rounded-2xl bg-white p-3 shadow-sm">
              {academiasFiltradas.length === 0 ? (
                <p className="text-sm text-zinc-500">
                  Nenhuma academia encontrada.
                </p>
              ) : (
                academiasFiltradas.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => trocarAcademia(item)}
                    className="rounded-xl px-3 py-2 text-left hover:bg-zinc-50"
                  >
                    <p className="text-sm font-bold text-zinc-950">
                      {item.nome}
                    </p>

                    <p className="text-xs text-zinc-500">
                      {item.cidade} {item.estado ? `- ${item.estado}` : ""}
                    </p>
                  </button>
                ))
              )}
            </div>
          )}

          <div className="mt-4 flex items-center gap-2">
            <QuadraFilter
              quadras={quadras}
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
              onSelect={selecionarHorario}
            />
          )}
        </section>
      </section>

      <AgendarJogoDialog
        open={dialogOpen}
        onOpenChange={fecharDialog}
        horario={horarioSelecionado}
        data={dataSelecionada}
        academiaId={academiaId}
        onSuccess={carregarAgenda}
      />
    </>
  );
}
