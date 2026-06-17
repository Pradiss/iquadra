"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";

import { AdminCard } from "@/components/admin/AdminCard";
import { AdminField } from "@/components/admin/AdminField";
import { AdminFeedback } from "@/components/admin/AdminFeedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  bloquearHorario,
  gerarHorarioQuadra,
  listarHorariosQuadra,
  listarQuadras,
  type HorarioQuadraAdmin,
  type QuadraAdmin,
} from "@/services/admin.service";
import {
  diasSemana,
  getDiaSemanaLabel,
  getErrorMessage,
  isPeriodoValido,
  todayInput,
  type Feedback,
  useAdminAcademia,
} from "@/components/admin/admin-helpers";

function ordenarHorarios(horarios: HorarioQuadraAdmin[]) {
  return [...horarios].sort((a, b) => {
    if (a.dia_semana !== b.dia_semana) {
      return a.dia_semana - b.dia_semana;
    }

    return a.abre_as.localeCompare(b.abre_as);
  });
}

export function AdminHorariosForm() {
  const academia = useAdminAcademia();

  const [quadras, setQuadras] = useState<QuadraAdmin[]>([]);
  const [horarios, setHorarios] = useState<HorarioQuadraAdmin[]>([]);
  const [selectedQuadra, setSelectedQuadra] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(Boolean(academia));
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    dias_semana: [] as number[],
    hora_inicio: "08:00",
    hora_fim: "22:00",
  });

  const [bloqueio, setBloqueio] = useState({
    data: todayInput,
    hora_inicio: "",
    hora_fim: "",
    motivo: "",
  });

  const carregarQuadras = useCallback(async () => {
    if (!academia) return;

    setLoading(true);

    try {
      const quadrasData = await listarQuadras(academia.id);

      setQuadras(Array.isArray(quadrasData) ? quadrasData : []);
      setSelectedQuadra((current) => current || quadrasData[0]?.id || "");
    } catch (error) {
      setFeedback({
        type: "error",
        message: getErrorMessage(
          error,
          "Não foi possível carregar as quadras.",
        ),
      });
    } finally {
      setLoading(false);
    }
  }, [academia]);

  const carregarHorarios = useCallback(async () => {
    if (!selectedQuadra) {
      setHorarios([]);
      return;
    }

    try {
      const data = await listarHorariosQuadra(selectedQuadra);
      setHorarios(Array.isArray(data) ? data : []);
    } catch (error) {
      setFeedback({
        type: "error",
        message: getErrorMessage(
          error,
          "Não foi possível carregar os horários.",
        ),
      });
    }
  }, [selectedQuadra]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void carregarQuadras();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [carregarQuadras]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void carregarHorarios();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [carregarHorarios]);

  function toggleDia(dia: number) {
    setForm((current) => {
      const selected = current.dias_semana.includes(dia);

      return {
        ...current,
        dias_semana: selected
          ? current.dias_semana.filter((item) => item !== dia)
          : [...current.dias_semana, dia],
      };
    });
  }

  async function handleGerar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    if (!selectedQuadra) {
      setFeedback({ type: "error", message: "Selecione uma quadra." });
      return;
    }

    if (form.dias_semana.length === 0) {
      setFeedback({
        type: "error",
        message: "Escolha pelo menos um dia da semana.",
      });
      return;
    }

    if (!isPeriodoValido(form.hora_inicio, form.hora_fim)) {
      setFeedback({
        type: "error",
        message: "A hora final precisa ser maior que a hora inicial.",
      });
      return;
    }

    try {
      setSaving(true);

      await Promise.all(
        form.dias_semana.map((dia) =>
          gerarHorarioQuadra(selectedQuadra, {
            dia_semana: dia,
            abre_as: form.hora_inicio,
            fecha_as: form.hora_fim,
            duracao_slot_minutos: 90,
          }),
        ),
      );
      setFeedback({
        type: "success",
        message: "Horários de 90 minutos gerados com sucesso.",
      });

      await carregarHorarios();
    } catch (error) {
      setFeedback({
        type: "error",
        message: getErrorMessage(error, "Não foi possível gerar os horários."),
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleBloquear(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    if (!selectedQuadra) {
      setFeedback({ type: "error", message: "Selecione uma quadra." });
      return;
    }

    if (!isPeriodoValido(bloqueio.hora_inicio, bloqueio.hora_fim)) {
      setFeedback({
        type: "error",
        message: "Informe um período válido para bloquear.",
      });
      return;
    }

    try {
      setSaving(true);

      await bloquearHorario(selectedQuadra, {
        data: bloqueio.data,
        hora_inicio: bloqueio.hora_inicio,
        hora_fim: bloqueio.hora_fim,
        motivo: bloqueio.motivo.trim() || "Bloqueio administrativo",
      });

      setBloqueio({
        data: todayInput,
        hora_inicio: "",
        hora_fim: "",
        motivo: "",
      });

      setFeedback({ type: "success", message: "Horário bloqueado." });
    } catch (error) {
      setFeedback({
        type: "error",
        message: getErrorMessage(error, "Não foi possível bloquear o horário."),
      });
    } finally {
      setSaving(false);
    }
  }

  if (!academia) {
    return (
      <AdminCard>
        <p className="text-sm text-zinc-500">
          Nenhuma academia vinculada ao usuário.
        </p>
      </AdminCard>
    );
  }

  return (
    <div className="grid gap-4">
      <AdminFeedback feedback={feedback} />

      <AdminCard>
        <AdminField label="Quadra">
          <select
            value={selectedQuadra}
            disabled={loading || quadras.length === 0}
            onChange={(event) => setSelectedQuadra(event.target.value)}
            className="h-[50px] w-full rounded-xl border border-input bg-gray-50 px-3 text-sm"
          >
            <option value="">
              {quadras.length === 0
                ? "Cadastre uma quadra primeiro"
                : "Selecione"}
            </option>

            {quadras.map((quadra) => (
              <option key={quadra.id} value={quadra.id}>
                {quadra.nome}
              </option>
            ))}
          </select>
        </AdminField>
      </AdminCard>

      <section className="grid gap-4 xl:grid-cols-2">
        <AdminCard
          title="Gerar horários fixos"
          description="Escolha os dias e o intervalo. O sistema cria slots de 90 minutos."
        >
          <form onSubmit={handleGerar} className="grid gap-3">
            <div>
              <p className="mb-2 text-xs font-semibold text-gray-700">
                Dias da semana
              </p>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {diasSemana.map((dia) => (
                  <button
                    key={dia.value}
                    type="button"
                    onClick={() => toggleDia(dia.value)}
                    className={[
                      "h-11 rounded-xl border px-3 text-sm font-semibold",
                      form.dias_semana.includes(dia.value)
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-200 bg-gray-50 text-gray-700",
                    ].join(" ")}
                  >
                    {dia.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <AdminField label="Hora inicial">
                <Input
                  type="time"
                  value={form.hora_inicio}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      hora_inicio: event.target.value,
                    }))
                  }
                  className="h-[50px] rounded-xl bg-gray-50"
                />
              </AdminField>

              <AdminField label="Hora final">
                <Input
                  type="time"
                  value={form.hora_fim}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      hora_fim: event.target.value,
                    }))
                  }
                  className="h-[50px] rounded-xl bg-gray-50"
                />
              </AdminField>
            </div>

            <p className="rounded-2xl bg-lime-50 px-4 py-3 text-sm font-semibold text-lime-800">
              Todos os slots gerados terão 90 minutos.
            </p>

            <Button
              disabled={saving || !selectedQuadra}
              className="h-[50px] rounded-xl bg-gray-900 text-white"
            >
              {saving ? "Gerando..." : "Gerar horários"}
            </Button>
          </form>
        </AdminCard>

        <AdminCard
          title="Bloquear horário"
          description="Bloqueie rapidamente um período desta quadra."
        >
          <form onSubmit={handleBloquear} className="grid gap-3">
            <AdminField label="Data">
              <Input
                type="date"
                value={bloqueio.data}
                onChange={(event) =>
                  setBloqueio((current) => ({
                    ...current,
                    data: event.target.value,
                  }))
                }
                className="h-[50px] rounded-xl bg-gray-50"
              />
            </AdminField>

            <div className="grid gap-3 sm:grid-cols-2">
              <AdminField label="Hora inicial">
                <Input
                  type="time"
                  value={bloqueio.hora_inicio}
                  onChange={(event) =>
                    setBloqueio((current) => ({
                      ...current,
                      hora_inicio: event.target.value,
                    }))
                  }
                  className="h-[50px] rounded-xl bg-gray-50"
                />
              </AdminField>

              <AdminField label="Hora final">
                <Input
                  type="time"
                  value={bloqueio.hora_fim}
                  onChange={(event) =>
                    setBloqueio((current) => ({
                      ...current,
                      hora_fim: event.target.value,
                    }))
                  }
                  className="h-[50px] rounded-xl bg-gray-50"
                />
              </AdminField>
            </div>

            <AdminField label="Motivo">
              <Input
                value={bloqueio.motivo}
                onChange={(event) =>
                  setBloqueio((current) => ({
                    ...current,
                    motivo: event.target.value,
                  }))
                }
                className="h-[50px] rounded-xl bg-gray-50"
              />
            </AdminField>

            <Button
              disabled={saving || !selectedQuadra}
              className="h-[50px] rounded-xl bg-gray-900 text-white"
            >
              {saving ? "Bloqueando..." : "Bloquear horário"}
            </Button>
          </form>
        </AdminCard>
      </section>

      <AdminCard
        title="Horários cadastrados"
        description="Lista de regras semanais da quadra selecionada."
      >
        {horarios.length === 0 ? (
          <p className="rounded-2xl bg-gray-50 p-4 text-sm text-zinc-500">
            Nenhum horário cadastrado para esta quadra.
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {ordenarHorarios(horarios).map((horario) => (
              <div key={horario.id} className="rounded-2xl bg-gray-50 p-4">
                <p className="text-sm font-bold text-zinc-950">
                  {getDiaSemanaLabel(horario.dia_semana)}
                </p>

                <p className="mt-1 text-sm font-semibold text-zinc-600">
                  {horario.abre_as} até {horario.fecha_as}
                </p>

                <p className="mt-1 text-xs font-bold text-green-700">
                  Slot de {horario.duracao_slot_minutos ?? 90} minutos
                </p>
              </div>
            ))}
          </div>
        )}
      </AdminCard>
    </div>
  );
}
