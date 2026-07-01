"use client";

import { useEffect, useMemo, useState } from "react";

import type { AcademiaBusca } from "@/components/jogador/painel/academia-search-modal";
import {
  buscarDisponibilidadeAdmin,
  cancelarAgendamentoAdmin,
  cancelarAulaAdmin,
  criarAgendamentoAdmin,
  criarAulaAdmin,
  criarEventoAdmin,
  listarQuadrasAdminAgenda,
  removerBloqueioAdmin,
  type DisponibilidadeAdmin,
  type QuadraAgenda,
  type UsuarioBusca,
} from "@/services/admin-agenda";

import type {
  FiltroStatus,
  FiltroTipo,
  FormEvento,
  LinhaAgenda,
} from "@/app/painel/admin/agenda/types";
import {
  createInitialForm,
  getErrorMessage,
  getHoje,
  minutesToTime,
  montarAcademiasAdmin,
  timeToMinutes,
} from "@/app/painel/admin/agenda/utils";
import { montarLinhasDisponibilidade } from "@/app/painel/admin/agenda/mappers/montarLinhasDisponibilidade";
import { useBuscaUsuariosAgenda } from "./useBuscaUsuariosAgenda";

export function useAdminAgenda() {
  const [dataSelecionada, setDataSelecionada] = useState(getHoje);
  const [academias, setAcademias] = useState<AcademiaBusca[]>([]);
  const [academiaSelecionada, setAcademiaSelecionada] =
    useState<AcademiaBusca | null>(null);

  const [quadras, setQuadras] = useState<QuadraAgenda[]>([]);
  const [quadraFiltro, setQuadraFiltro] = useState("TODAS");
  const [tipoFiltro, setTipoFiltro] = useState<FiltroTipo>("TODOS");
  const [statusFiltro, setStatusFiltro] = useState<FiltroStatus>("TODOS");

  const [disponibilidade, setDisponibilidade] =
    useState<DisponibilidadeAdmin>();

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [formError, setFormError] = useState("");

  const [form, setForm] = useState<FormEvento>(() =>
    createInitialForm(getHoje()),
  );

  const buscaUsuarios = useBuscaUsuariosAgenda(dialogOpen);

  const linhas = useMemo(
    () => montarLinhasDisponibilidade(disponibilidade),
    [disponibilidade],
  );

  const linhasFiltradas = useMemo(() => {
    return linhas.filter((linha) => {
      const passaQuadra =
        quadraFiltro === "TODAS" || linha.quadraId === quadraFiltro;
      const passaTipo = tipoFiltro === "TODOS" || linha.tipo === tipoFiltro;
      const passaStatus =
        statusFiltro === "TODOS" || linha.status === statusFiltro;

      return passaQuadra && passaTipo && passaStatus;
    });
  }, [linhas, quadraFiltro, statusFiltro, tipoFiltro]);

  const quadraAtual = useMemo(() => {
    if (quadraFiltro === "TODAS") return null;
    return quadras.find((quadra) => quadra.id === quadraFiltro) ?? null;
  }, [quadraFiltro, quadras]);

  const linhasPorQuadra = useMemo(() => {
    const grouped = new Map<string, LinhaAgenda[]>();

    for (const linha of linhasFiltradas) {
      const key = linha.quadraId;
      grouped.set(key, [...(grouped.get(key) ?? []), linha]);
    }

    return Array.from(grouped.entries()).map(([quadraId, items]) => ({
      quadra:
        quadras.find((quadra) => quadra.id === quadraId) ??
        ({
          id: quadraId,
          nome: items[0]?.quadraNome ?? "Quadra",
          tipo_piso: items[0]?.modalidade,
        } as QuadraAgenda),
      items,
    }));
  }, [linhasFiltradas, quadras]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const academiasAdmin = montarAcademiasAdmin();
      setAcademias(academiasAdmin);
      setAcademiaSelecionada(academiasAdmin[0] ?? null);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  async function carregarAgenda() {
    if (!academiaSelecionada?.id) {
      setLoading(false);
      setQuadras([]);
      setDisponibilidade(undefined);
      return;
    }

    setLoading(true);
    setErro("");

    try {
      const [quadrasData, disponibilidadeData] = await Promise.all([
        listarQuadrasAdminAgenda(academiaSelecionada.id),
        buscarDisponibilidadeAdmin({
          academiaId: academiaSelecionada.id,
          data: dataSelecionada,
        }),
      ]);

      setQuadras(quadrasData);
      setDisponibilidade(disponibilidadeData);

      if (
        quadraFiltro !== "TODAS" &&
        !quadrasData.some((quadra) => quadra.id === quadraFiltro)
      ) {
        setQuadraFiltro("TODAS");
      }
    } catch (error) {
      setErro(getErrorMessage(error));
      setQuadras([]);
      setDisponibilidade(undefined);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void carregarAgenda();
    }, 0);

    return () => window.clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [academiaSelecionada?.id, dataSelecionada]);

  function abrirNovoEvento(linha?: LinhaAgenda) {
    const quadraId = linha?.quadraId || quadraAtual?.id || quadras[0]?.id || "";
    const inicio = linha?.inicio || "08:00";
    const fim = linha?.fim || minutesToTime(timeToMinutes(inicio) + 60);

    setForm({
      ...createInitialForm(dataSelecionada, quadraId),
      horaInicio: inicio,
      horaFim: fim,
    });

    setFormError("");
    buscaUsuarios.limparBusca();
    setDialogOpen(true);
  }

  function handlePickUser(usuario: UsuarioBusca) {
    if (buscaUsuarios.buscaModo === "PARTICIPANTE") {
      const max = form.tipoJogo === "SIMPLES" ? 1 : 3;

      if (!form.participantes.some((item) => item.id === usuario.id)) {
        setForm({
          ...form,
          participantes: [...form.participantes, usuario].slice(0, max),
        });
      }
    }

    if (buscaUsuarios.buscaModo === "PROFESSOR") {
      setForm({ ...form, professor: usuario });
    }

    if (buscaUsuarios.buscaModo === "CLIENTE") {
      setForm({ ...form, cliente: usuario });
    }

    buscaUsuarios.limparBusca();
  }

  function removerParticipante(usuarioId: string) {
    setForm({
      ...form,
      participantes: form.participantes.filter(
        (participante) => participante.id !== usuarioId,
      ),
    });
  }

  async function salvarEvento() {
    if (!academiaSelecionada?.id || !form.quadraId) {
      setFormError("Selecione uma academia e uma quadra.");
      return;
    }

    if (!form.data || !form.horaInicio || !form.horaFim) {
      setFormError("Informe data, início e fim.");
      return;
    }

    if (timeToMinutes(form.horaFim) <= timeToMinutes(form.horaInicio)) {
      setFormError("O horário final deve ser maior que o inicial.");
      return;
    }

    if (form.tipo === "EVENTO" && !form.motivo.trim()) {
      setFormError("Informe o motivo do evento.");
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      if (form.tipo === "PARTIDA") {
        await criarAgendamentoAdmin({
          academia_id: academiaSelecionada.id,
          quadra_id: form.quadraId,
          data: form.data,
          hora_inicio: form.horaInicio,
          hora_fim: form.horaFim,
          tipo_jogo: form.tipoJogo,
          participantes: form.participantes.map((participante) => ({
            usuario_id: participante.id,
            nome: participante.nome,
          })),
        });
      }

      if (form.tipo === "AULA") {
        await criarAulaAdmin({
          academia_id: academiaSelecionada.id,
          quadra_id: form.quadraId,
          data: form.data,
          hora_inicio: form.horaInicio,
          hora_fim: form.horaFim,
          professor_id: form.professor?.id,
          cliente_id: form.cliente?.id,
          observacoes: form.observacoes.trim() || undefined,
        });
      }

      if (form.tipo === "EVENTO") {
        await criarEventoAdmin({
          quadra_id: form.quadraId,
          data: form.data,
          hora_inicio: form.horaInicio,
          hora_fim: form.horaFim,
          motivo: form.motivo.trim(),
          tipo_bloqueio: "EVENTO",
        });
      }

      setDialogOpen(false);
      await carregarAgenda();
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function executarAcaoLinha(linha: LinhaAgenda) {
    if (linha.tipo === "LIVRE") {
      abrirNovoEvento(linha);
      return;
    }

    const confirmed = window.confirm(
      linha.tipo === "BLOQUEIO"
        ? "Remover este evento?"
        : "Cancelar este agendamento?",
    );

    if (!confirmed) return;

    setActionLoadingId(linha.id);
    setErro("");

    try {
      if (linha.jogoId) await cancelarAgendamentoAdmin(linha.jogoId);
      if (linha.aulaId) await cancelarAulaAdmin(linha.aulaId);
      if (linha.bloqueioId) await removerBloqueioAdmin(linha.bloqueioId);

      await carregarAgenda();
    } catch (error) {
      setErro(getErrorMessage(error));
    } finally {
      setActionLoadingId("");
    }
  }

  return {
    dataSelecionada,
    setDataSelecionada,

    academias,
    academiaSelecionada,
    setAcademiaSelecionada,

    quadras,
    quadraFiltro,
    setQuadraFiltro,
    tipoFiltro,
    setTipoFiltro,
    statusFiltro,
    setStatusFiltro,

    loading,
    erro,

    dialogOpen,
    setDialogOpen,
    saving,
    actionLoadingId,
    formError,
    form,
    setForm,

    linhasPorQuadra,

    abrirNovoEvento,
    executarAcaoLinha,
    salvarEvento,
    handlePickUser,
    removerParticipante,

    ...buscaUsuarios,
  };
}
