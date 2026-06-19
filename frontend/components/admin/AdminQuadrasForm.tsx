"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Pencil, Trash2 } from "lucide-react";

import { AdminCard } from "@/components/admin/AdminCard";
import { AdminField } from "@/components/admin/AdminField";
import { AdminFeedback } from "@/components/admin/AdminFeedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  atualizarQuadra,
  atualizarStatusQuadra,
  criarQuadra,
  excluirQuadra,
  listarQuadras,
  type ModalidadeQuadra,
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

const modalidades: { value: ModalidadeQuadra; label: string }[] = [
  { value: "TENIS", label: "Tenis" },
  { value: "BEACH_TENNIS", label: "Beach Tennis" },
  { value: "PADEL", label: "Padel" },
  { value: "PICKLEBALL", label: "Pickleball" },
  { value: "OUTRO", label: "Outro" },
];

const formInicial = {
  nome: "",
  descricao: "",
  tipo_piso: "SINTETICA" as TipoPiso,
  modalidade: "TENIS" as ModalidadeQuadra,
  valor_hora: "",
  coberta: false,
  capacidade_minima: "2",
  capacidade_maxima: "4",
  permite_simples: true,
  permite_dupla: true,
};

function getModalidadeLabel(value?: string | null) {
  return (
    modalidades.find((modalidade) => modalidade.value === value)?.label ??
    "Sem modalidade"
  );
}

function formatarValor(value?: number | null) {
  if (value === null || value === undefined) return "Sem valor";

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function AdminQuadrasForm() {
  const academia = useAdminAcademia();

  const [quadras, setQuadras] = useState<QuadraAdmin[]>([]);
  const [loading, setLoading] = useState(Boolean(academia));
  const [saving, setSaving] = useState(false);
  const [acaoQuadraId, setAcaoQuadraId] = useState<string | null>(null);
  const [quadraEditandoId, setQuadraEditandoId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [form, setForm] = useState(formInicial);

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
    const timeoutId = window.setTimeout(() => {
      void carregar();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [carregar]);

  function limparFormulario() {
    setQuadraEditandoId(null);
    setForm(formInicial);
  }

  function preencherFormularioParaEditar(quadra: QuadraAdmin) {
    setQuadraEditandoId(quadra.id);

    setForm({
      nome: quadra.nome ?? "",
      descricao: quadra.descricao ?? "",
      tipo_piso: (quadra.tipo_piso ?? "SINTETICA") as TipoPiso,
      modalidade: (quadra.modalidade ?? "TENIS") as ModalidadeQuadra,
      valor_hora:
        quadra.valor_hora !== null && quadra.valor_hora !== undefined
          ? String(quadra.valor_hora)
          : "",
      coberta: Boolean(quadra.coberta),
      capacidade_minima: String(quadra.capacidade_minima ?? 2),
      capacidade_maxima: String(quadra.capacidade_maxima ?? 4),
      permite_simples: quadra.permite_simples ?? true,
      permite_dupla: quadra.permite_dupla ?? true,
    });

    setFeedback({
      type: "success",
      message: `Editando a quadra "${quadra.nome}".`,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

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

      const payload = {
        nome: form.nome.trim(),
        descricao: form.descricao.trim() || undefined,
        tipo_piso: form.tipo_piso,
        modalidade: form.modalidade,
        valor_hora:
          form.valor_hora.trim() === ""
            ? undefined
            : Number(form.valor_hora.replace(",", ".")),
        coberta: form.coberta,
        capacidade_minima: Number(form.capacidade_minima),
        capacidade_maxima: Number(form.capacidade_maxima),
        permite_simples: form.permite_simples,
        permite_dupla: form.permite_dupla,
      };

      if (quadraEditandoId) {
        await atualizarQuadra(quadraEditandoId, payload);

        setFeedback({
          type: "success",
          message: "Quadra atualizada com sucesso.",
        });
      } else {
        await criarQuadra(academia.id, payload);

        setFeedback({
          type: "success",
          message: "Quadra cadastrada com sucesso.",
        });
      }

      limparFormulario();
      await carregar();
    } catch (error) {
      setFeedback({
        type: "error",
        message: getErrorMessage(
          error,
          quadraEditandoId
            ? "Não foi possível atualizar a quadra."
            : "Não foi possível cadastrar a quadra."
        ),
      });
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(quadra: QuadraAdmin) {
    setFeedback(null);
    setAcaoQuadraId(quadra.id);

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
    } finally {
      setAcaoQuadraId(null);
    }
  }

  async function excluirQuadraSelecionada(quadra: QuadraAdmin) {
    const confirmou = window.confirm(
      `Excluir a quadra "${quadra.nome}"? Se ela tiver jogos ou aulas vinculados, use Inativar.`
    );

    if (!confirmou) return;

    setFeedback(null);
    setAcaoQuadraId(quadra.id);

    try {
      await excluirQuadra(quadra.id);

      if (quadraEditandoId === quadra.id) {
        limparFormulario();
      }

      setFeedback({
        type: "success",
        message: "Quadra excluída com sucesso.",
      });

      await carregar();
    } catch (error) {
      setFeedback({
        type: "error",
        message: getErrorMessage(error, "Não foi possível excluir a quadra."),
      });
    } finally {
      setAcaoQuadraId(null);
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
        title={quadraEditandoId ? "Editar quadra" : "Cadastrar quadra"}
        description={
          quadraEditandoId
            ? "Atualize os dados da quadra selecionada."
            : "Adicione uma nova quadra da academia."
        }
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
            <AdminField label="Modalidade">
              <select
                value={form.modalidade}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    modalidade: event.target.value as ModalidadeQuadra,
                  }))
                }
                className="h-[50px] w-full rounded-xl border border-input bg-gray-50 px-3 text-sm"
              >
                {modalidades.map((modalidade) => (
                  <option key={modalidade.value} value={modalidade.value}>
                    {modalidade.label}
                  </option>
                ))}
              </select>
            </AdminField>

            <AdminField label="Valor da quadra">
              <Input
                type="number"
                min={0}
                step="0.01"
                value={form.valor_hora}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    valor_hora: event.target.value,
                  }))
                }
                placeholder="Ex: 80"
                className="h-[50px] rounded-xl bg-gray-50"
              />
            </AdminField>
          </div>

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
            {saving
              ? "Salvando..."
              : quadraEditandoId
                ? "Salvar alterações"
                : "Cadastrar quadra"}
          </Button>

          {quadraEditandoId && (
            <Button
              type="button"
              variant="outline"
              onClick={limparFormulario}
              className="h-[50px] rounded-xl bg-white"
            >
              Cancelar edição
            </Button>
          )}
        </form>
      </AdminCard>

      <AdminCard
        title="Quadras cadastradas"
        description="Edite, inative ou exclua quadras sem agenda vinculada."
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
                  <p className="mt-1 text-xs font-semibold text-zinc-500">
                    {getModalidadeLabel(quadra.modalidade)} -{" "}
                    {formatarValor(quadra.valor_hora)}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
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
                    disabled={acaoQuadraId === quadra.id}
                    onClick={() => preencherFormularioParaEditar(quadra)}
                    className="h-9 gap-1 rounded-xl bg-white"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Editar
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={acaoQuadraId === quadra.id}
                    onClick={() => void toggleStatus(quadra)}
                    className="h-9 rounded-xl bg-white"
                  >
                    {quadra.ativa ? "Inativar" : "Ativar"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={acaoQuadraId === quadra.id}
                    onClick={() => void excluirQuadraSelecionada(quadra)}
                    className="h-9 gap-1 rounded-xl border-red-200 bg-white text-red-700 hover:bg-red-50 hover:text-red-800"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Excluir
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
