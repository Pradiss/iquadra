"use client";

import { Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type {
  QuadraAgenda,
  UsuarioBusca,
  TipoJogoAgenda,
} from "@/services/admin-agenda";

import type {
  BuscaUsuarioModo,
  FormEvento,
  TipoNovoEvento,
} from "@/app/painel/admin/agenda/types";
import { setFormEndByDuration } from "@/app/painel/admin/agenda/utils";
import { UserSearch } from "./UserSearch";

type AddEventDialogProps = {
  open: boolean;
  form: FormEvento;
  quadras: QuadraAgenda[];
  saving: boolean;
  error: string;
  busca: string;
  buscaModo: BuscaUsuarioModo;
  usuarios: UsuarioBusca[];
  buscandoUsuarios: boolean;
  onOpenChange: (open: boolean) => void;
  onFormChange: (form: FormEvento) => void;
  onSearch: (modo: BuscaUsuarioModo, value: string) => void;
  onPickUser: (usuario: UsuarioBusca) => void;
  onRemoveParticipant: (usuarioId: string) => void;
  onSubmit: () => void;
};

export function AddEventDialog({
  open,
  form,
  quadras,
  saving,
  error,
  busca,
  buscaModo,
  usuarios,
  buscandoUsuarios,
  onOpenChange,
  onFormChange,
  onSearch,
  onPickUser,
  onRemoveParticipant,
  onSubmit,
}: AddEventDialogProps) {
  const maxParticipantes = form.tipoJogo === "SIMPLES" ? 1 : 3;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Adicionar evento</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid grid-cols-3 gap-2">
            {[
              ["PARTIDA", "Partida"],
              ["AULA", "Aula"],
              ["EVENTO", "Evento"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() =>
                  onFormChange({ ...form, tipo: value as TipoNovoEvento })
                }
                className={[
                  "h-10 rounded-lg border text-sm font-black",
                  form.tipo === value
                    ? "border-zinc-950 bg-zinc-950 text-white"
                    : "border-zinc-200 bg-white text-zinc-700",
                ].join(" ")}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-bold">
              Quadra
              <select
                value={form.quadraId}
                onChange={(event) =>
                  onFormChange({ ...form, quadraId: event.target.value })
                }
                className="h-10 rounded-lg border border-zinc-200 bg-white px-3"
              >
                {quadras.map((quadra) => (
                  <option key={quadra.id} value={quadra.id}>
                    {quadra.nome}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1.5 text-sm font-bold">
              Data
              <Input
                type="date"
                value={form.data}
                onChange={(event) =>
                  onFormChange({ ...form, data: event.target.value })
                }
              />
            </label>

            <label className="grid gap-1.5 text-sm font-bold">
              Início
              <Input
                type="time"
                value={form.horaInicio}
                onChange={(event) =>
                  onFormChange({ ...form, horaInicio: event.target.value })
                }
              />
            </label>

            <label className="grid gap-1.5 text-sm font-bold">
              Fim
              <Input
                type="time"
                value={form.horaFim}
                onChange={(event) =>
                  onFormChange({ ...form, horaFim: event.target.value })
                }
              />
            </label>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[60, 90, 120].map((duration) => (
              <Button
                key={duration}
                type="button"
                variant="outline"
                onClick={() =>
                  onFormChange(setFormEndByDuration(form, duration))
                }
              >
                {duration} min
              </Button>
            ))}
          </div>

          {form.tipo === "PARTIDA" && (
            <div className="grid gap-3">
              <label className="grid gap-1.5 text-sm font-bold">
                Tipo de jogo
                <select
                  value={form.tipoJogo}
                  onChange={(event) =>
                    onFormChange({
                      ...form,
                      tipoJogo: event.target.value as TipoJogoAgenda,
                      participantes: form.participantes.slice(
                        0,
                        event.target.value === "SIMPLES" ? 1 : 3,
                      ),
                    })
                  }
                  className="h-10 rounded-lg border border-zinc-200 bg-white px-3"
                >
                  <option value="SIMPLES">Simples</option>
                  <option value="DUPLA">Dupla</option>
                </select>
              </label>

              <div className="grid gap-2">
                <p className="text-sm font-bold">
                  Participantes opcionais ({form.participantes.length}/
                  {maxParticipantes})
                </p>

                <UserSearch
                  value={buscaModo === "PARTICIPANTE" ? busca : ""}
                  results={usuarios}
                  loading={buscandoUsuarios}
                  placeholder="Buscar cliente"
                  onChange={(value) => onSearch("PARTICIPANTE", value)}
                  onClear={() => onSearch(null, "")}
                  onPick={onPickUser}
                />

                <div className="flex flex-wrap gap-2">
                  {form.participantes.map((participante) => (
                    <span
                      key={participante.id}
                      className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-xs font-black"
                    >
                      {participante.nome}

                      <button
                        type="button"
                        onClick={() => onRemoveParticipant(participante.id)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {form.tipo === "AULA" && (
            <div className="grid gap-3">
              <div className="grid gap-2">
                <p className="text-sm font-bold">Professor</p>

                <UserSearch
                  value={buscaModo === "PROFESSOR" ? busca : ""}
                  results={usuarios}
                  loading={buscandoUsuarios}
                  placeholder={form.professor?.nome || "Buscar professor"}
                  onChange={(value) => onSearch("PROFESSOR", value)}
                  onClear={() => onSearch(null, "")}
                  onPick={onPickUser}
                />
              </div>

              <div className="grid gap-2">
                <p className="text-sm font-bold">Cliente</p>

                <UserSearch
                  value={buscaModo === "CLIENTE" ? busca : ""}
                  results={usuarios}
                  loading={buscandoUsuarios}
                  placeholder={form.cliente?.nome || "Buscar cliente"}
                  onChange={(value) => onSearch("CLIENTE", value)}
                  onClear={() => onSearch(null, "")}
                  onPick={onPickUser}
                />
              </div>

              <label className="grid gap-1.5 text-sm font-bold">
                Observação
                <Textarea
                  value={form.observacoes}
                  onChange={(event) =>
                    onFormChange({ ...form, observacoes: event.target.value })
                  }
                  placeholder="Aula particular"
                />
              </label>
            </div>
          )}

          {form.tipo === "EVENTO" && (
            <label className="grid gap-1.5 text-sm font-bold">
              Motivo do evento
              <Textarea
                value={form.motivo}
                onChange={(event) =>
                  onFormChange({ ...form, motivo: event.target.value })
                }
                placeholder="Evento"
              />
            </label>
          )}

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancelar
          </Button>

          <Button type="button" onClick={onSubmit} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
