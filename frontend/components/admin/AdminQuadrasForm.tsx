"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";

import { AdminCard } from "@/components/admin/AdminCard";
import { AdminField } from "@/components/admin/AdminField";
import { AdminFeedback } from "@/components/admin/AdminFeedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  atualizarStatusQuadra,
  criarQuadra,
  listarQuadras,
  type QuadraAdmin,
  type TipoPiso,
} from "@/services/admin.service";
import {
  getErrorMessage,
  type Feedback,
  useAdminAcademia,
} from "@/components/admin/admin-helpers";

const tiposPiso: { value: TipoPiso; label: string }[] = [
  { value: "SAIBRO", label: "Saibro" },
  { value: "HARD", label: "Hard" },
  { value: "GRAMA", label: "Grama" },
  { value: "SINTETICA", label: "Sintética" },
  { value: "AREIA", label: "Areia" },
  { value: "OUTRO", label: "Outro" },
];

export function AdminQuadrasForm() {
  const academia = useAdminAcademia();

  const [quadras, setQuadras] = useState<QuadraAdmin[]>([]);
  const [loading, setLoading] = useState(Boolean(academia));
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const [form, setForm] = useState({
    nome: "",
    descricao: "",
    tipo_piso: "SINTETICA" as TipoPiso,
    coberta: false,
    capacidade_minima: "2",
    capacidade_maxima: "4",
    permite_simples: true,
    permite_dupla: true,
  });

  const carregar = useCallback(async () => {
    if (!academia) return;

    setLoading(true);

    try {
      const data = await listarQuadras(academia.id);
      setQuadras(Array.isArray(data) ? data : []);
    } catch (error) {
      setFeedback({
        type: "error",
        message: getErrorMessage(error, "Não foi possível carregar as quadras."),
      });
    } finally {
      setLoading(false);
    }
  }, [academia]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!academia) return;

    setFeedback(null);

    if (form.nome.trim().length < 2) {
      setFeedback({ type: "error", message: "Informe o nome da quadra." });
      return;
    }

    try {
      setSaving(true);

      await criarQuadra(academia.id, {
        nome: form.nome.trim(),
        descricao: form.descricao.trim() || undefined,
        tipo_piso: form.tipo_piso,
        coberta: form.coberta,
        capacidade_minima: Number(form.capacidade_minima),
        capacidade_maxima: Number(form.capacidade_maxima),
        permite_simples: form.permite_simples,
        permite_dupla: form.permite_dupla,
      });

      setForm({
        nome: "",
        descricao: "",
        tipo_piso: "SINTETICA",
        coberta: false,
        capacidade_minima: "2",
        capacidade_maxima: "4",
        permite_simples: true,
        permite_dupla: true,
      });

      setFeedback({ type: "success", message: "Quadra cadastrada com sucesso." });
      await carregar();
    } catch (error) {
      setFeedback({
        type: "error",
        message: getErrorMessage(error, "Não foi possível cadastrar a quadra."),
      });
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(quadra: QuadraAdmin) {
    setFeedback(null);

    try {
      await atualizarStatusQuadra(quadra.id, !quadra.ativa);

      setFeedback({
        type: "success",
        message: quadra.ativa ? "Quadra inativada." : "Quadra ativada.",
      });

      await carregar();
    } catch (error) {
      setFeedback({
        type: "error",
        message: getErrorMessage(error, "Não foi possível alterar a quadra."),
      });
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
    <div className="grid gap-4 xl:grid-cols-[1fr_1.4fr]">
      <AdminCard
        title="Cadastrar quadra"
        description="Adicione uma nova quadra da academia."
      >
        <AdminFeedback feedback={feedback} />

        <form onSubmit={handleSubmit} className="grid gap-3">
          <AdminField label="Nome da quadra">
            <Input
              value={form.nome}
              onChange={(event) =>
                setForm((current) => ({ ...current, nome: event.target.value }))
              }
              className="h-[50px] rounded-xl bg-gray-50"
            />
          </AdminField>

          <AdminField label="Descrição curta">
            <Textarea
              value={form.descricao}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  descricao: event.target.value,
                }))
              }
              className="min-h-20 rounded-xl bg-gray-50"
            />
          </AdminField>

          <AdminField label="Tipo de piso">
            <select
              value={form.tipo_piso}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  tipo_piso: event.target.value as TipoPiso,
                }))
              }
              className="h-[50px] w-full rounded-xl border border-input bg-gray-50 px-3 text-sm"
            >
              {tiposPiso.map((tipo) => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </AdminField>

          <div className="grid gap-3 sm:grid-cols-2">
            <AdminField label="Capacidade mínima">
              <Input
                type="number"
                min={2}
                max={4}
                value={form.capacidade_minima}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    capacidade_minima: event.target.value,
                  }))
                }
                className="h-[50px] rounded-xl bg-gray-50"
              />
            </AdminField>

            <AdminField label="Capacidade máxima">
              <Input
                type="number"
                min={2}
                max={4}
                value={form.capacidade_maxima}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    capacidade_maxima: event.target.value,
                  }))
                }
                className="h-[50px] rounded-xl bg-gray-50"
              />
            </AdminField>
          </div>

          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <input
              type="checkbox"
              checked={form.coberta}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  coberta: event.target.checked,
                }))
              }
            />
            Quadra coberta
          </label>

          <Button
            disabled={saving}
            className="h-[50px] rounded-xl bg-gray-900 text-white"
          >
            {saving ? "Salvando..." : "Cadastrar quadra"}
          </Button>
        </form>
      </AdminCard>

      <AdminCard
        title="Quadras cadastradas"
        description="Ative ou inative quadras conforme a operação."
      >
        {loading ? (
          <p className="text-sm text-zinc-500">Carregando quadras...</p>
        ) : quadras.length === 0 ? (
          <p className="rounded-2xl bg-gray-50 p-4 text-sm text-zinc-500">
            Nenhuma quadra cadastrada.
          </p>
        ) : (
          <div className="grid gap-2">
            {quadras.map((quadra) => (
              <div
                key={quadra.id}
                className="flex flex-col gap-3 rounded-2xl bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-bold text-zinc-950">
                    {quadra.nome}
                  </p>
                  <p className="text-xs font-medium text-zinc-500">
                    {quadra.tipo_piso} - {quadra.coberta ? "Coberta" : "Aberta"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={[
                      "rounded-full px-3 py-1 text-xs font-bold",
                      quadra.ativa
                        ? "bg-lime-50 text-lime-700"
                        : "bg-red-50 text-red-700",
                    ].join(" ")}
                  >
                    {quadra.ativa ? "Ativa" : "Inativa"}
                  </span>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void toggleStatus(quadra)}
                    className="h-9 rounded-xl bg-white"
                  >
                    {quadra.ativa ? "Inativar" : "Ativar"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>
    </div>
  );
}