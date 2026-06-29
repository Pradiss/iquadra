"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarPlus, Lock, MapPin, Search, UserPlus } from "lucide-react";

import { AdminPage } from "@/components/admin/AdminPage";
import {
  AgendaFilterBar,
  agendaFiltroInicial,
  type AgendaFiltros,
} from "@/components/jogador/painel/agenda-filter-bar";
import { AgendaCalendar } from "@/components/jogador/painel/agenda-calendar";
import { AgendaList } from "@/components/jogador/painel/agenda-list";
import {
  AcademiaSearchModal,
  type AcademiaBusca,
} from "@/components/jogador/painel/academia-search-modal";
import { Button } from "@/components/ui/button";
import { getUsuario } from "@/lib/auth-storage";
import { getAdminAcademias } from "@/lib/user-role";

type ParticipanteAdminVisual = {
  id: string;
  nome: string;
  foto_perfil?: string | null;
  categoria?: string | null;
};

type HorarioAdminVisual = {
  id: string;
  hora: string;
  horaFim: string;
  inicioPermitido?: string;
  fimPermitido?: string;
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
    maximo_participantes?: number;
    participantes: ParticipanteAdminVisual[];
    observacoes?: string | null;
  } | null;
};

type AcaoAdmin = "RESERVAR" | "AULA" | "BLOQUEAR";

const MAX_DIAS_AGENDAMENTO = 30;

const ACADEMIA_FALLBACK: AcademiaBusca = {
  id: "academia-admin",
  nome: "Academia admin",
};

const ACOES: {
  value: AcaoAdmin;
  label: string;
  icon: typeof UserPlus;
}[] = [
  { value: "RESERVAR", label: "Reservar", icon: UserPlus },
  { value: "AULA", label: "Criar aula", icon: CalendarPlus },
  { value: "BLOQUEAR", label: "Bloquear", icon: Lock },
];

function getHoje() {
  const agora = new Date();

  return [
    agora.getFullYear(),
    String(agora.getMonth() + 1).padStart(2, "0"),
    String(agora.getDate()).padStart(2, "0"),
  ].join("-");
}

function montarAcademiasAdmin() {
  const usuario = getUsuario();
  const vinculos = getAdminAcademias(usuario);

  return vinculos
    .map((vinculo, index): AcademiaBusca => {
      const academia = vinculo.academia;

      return {
        id:
          vinculo.academia_id ||
          academia?.id ||
          vinculo.id ||
          `academia-admin-${index}`,
        nome: academia?.nome || `Academia ${index + 1}`,
        cidade: academia?.cidade,
        estado: academia?.estado,
      };
    })
    .filter((academia) => Boolean(academia.id));
}

function formatarAcademiaAtual(academia?: AcademiaBusca | null) {
  if (!academia) return "Selecionar academia";

  const cidade = academia.cidade?.trim();
  const estado = academia.estado?.trim();
  const local = cidade && estado ? `${cidade} - ${estado}` : cidade || estado;

  return local ? `${academia.nome} - ${local}` : academia.nome;
}

function montarHorariosVisuais(data: string): HorarioAdminVisual[] {
  return [
    {
      id: `${data}-quadra-1-0800`,
      hora: "08:00",
      horaFim: "09:00",
      inicioPermitido: "08:00",
      fimPermitido: "09:00",
      quadraId: "quadra-1",
      quadraNome: "Q1",
      disponivel: true,
      motivo: null,
      capacidadeMinima: 2,
      capacidadeMaxima: 4,
      permiteSimples: true,
      permiteDupla: true,
      jogadoresConfirmados: 0,
      vagasDisponiveis: 4,
      jogo: null,
    },
    {
      id: `${data}-quadra-1-0900`,
      hora: "09:00",
      horaFim: "10:30",
      quadraId: "quadra-1",
      quadraNome: "Q1",
      disponivel: false,
      motivo: "JOGO",
      capacidadeMinima: 2,
      capacidadeMaxima: 4,
      permiteSimples: true,
      permiteDupla: true,
      jogadoresConfirmados: 2,
      vagasDisponiveis: 2,
      jogo: {
        id: "jogo-visual-1",
        maximo_participantes: 4,
        participantes: [
          { id: "jogador-1", nome: "Cliente 1", categoria: "B" },
          { id: "jogador-2", nome: "Cliente 2", categoria: "C" },
        ],
      },
    },
    {
      id: `${data}-quadra-2-1030`,
      hora: "10:30",
      horaFim: "11:30",
      quadraId: "quadra-2",
      quadraNome: "Q2",
      disponivel: false,
      motivo: "AULA",
      capacidadeMinima: 1,
      capacidadeMaxima: 4,
      permiteSimples: true,
      permiteDupla: true,
      jogadoresConfirmados: 0,
      vagasDisponiveis: 0,
      jogo: null,
    },
    {
      id: `${data}-quadra-1-1200`,
      hora: "12:00",
      horaFim: "13:00",
      quadraId: "quadra-1",
      quadraNome: "Q1",
      disponivel: false,
      motivo: "BLOQUEADO",
      capacidadeMinima: 2,
      capacidadeMaxima: 4,
      permiteSimples: true,
      permiteDupla: true,
      jogadoresConfirmados: 0,
      vagasDisponiveis: 0,
      jogo: null,
    },
    {
      id: `${data}-quadra-2-1800`,
      hora: "18:00",
      horaFim: "19:30",
      inicioPermitido: "18:00",
      fimPermitido: "19:30",
      quadraId: "quadra-2",
      quadraNome: "Q2",
      disponivel: true,
      motivo: null,
      capacidadeMinima: 2,
      capacidadeMaxima: 4,
      permiteSimples: true,
      permiteDupla: true,
      jogadoresConfirmados: 0,
      vagasDisponiveis: 4,
      jogo: null,
    },
  ];
}

export default function AdminAgendaPage() {
  const [dataSelecionada, setDataSelecionada] = useState(getHoje);
  const [filtros, setFiltros] = useState<AgendaFiltros>(agendaFiltroInicial);
  const [acaoSelecionada, setAcaoSelecionada] =
    useState<AcaoAdmin>("RESERVAR");
  const [modalAcademiasOpen, setModalAcademiasOpen] = useState(false);
  const [academias, setAcademias] = useState<AcademiaBusca[]>([
    ACADEMIA_FALLBACK,
  ]);
  const [academiaSelecionada, setAcademiaSelecionada] =
    useState<AcademiaBusca | null>(ACADEMIA_FALLBACK);

  const horarios = useMemo(
    () => montarHorariosVisuais(dataSelecionada),
    [dataSelecionada],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const academiasAdmin = montarAcademiasAdmin();
      const lista =
        academiasAdmin.length > 0 ? academiasAdmin : [ACADEMIA_FALLBACK];

      setAcademias(lista);
      setAcademiaSelecionada(lista[0]);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <AdminPage
      title="Agenda"
      description="Veja os horarios do dia e faça agendamentos manuais."
    >
      <section>
        

        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {ACOES.map((acao) => {
            const Icon = acao.icon;
            const active = acaoSelecionada === acao.value;

            return (
              <Button
                key={acao.value}
                type="button"
                variant={active ? "default" : "outline"}
                onClick={() => setAcaoSelecionada(acao.value)}
                className="h-10 shrink-0 gap-2 rounded-xl px-4 font-black"
              >
                <Icon className="h-4 w-4" />
                {acao.label}
              </Button>
            );
          })}
        </div>

        <AgendaCalendar
          dataSelecionada={dataSelecionada}
          onSelectData={setDataSelecionada}
          maxDiasAgendamento={MAX_DIAS_AGENDAMENTO}
        />

        <AgendaList horarios={horarios} onSelect={() => undefined} />
      </section>

      <AcademiaSearchModal
        open={modalAcademiasOpen}
        academias={academias}
        selectedAcademia={academiaSelecionada}
        onOpenChange={setModalAcademiasOpen}
        onSelect={setAcademiaSelecionada}
      />
    </AdminPage>
  );
}
