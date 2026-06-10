"use client"

import { Search, UserRoundPlus, X } from "lucide-react"
import { getInitials } from "@/shared/lib/painel-format"
import type { JogoParticipante } from "@/shared/types/agenda"
import type { UsuarioSocial } from "@/shared/types/social"

type InvitePlayersPanelProps = {
  mode: "create" | "invite" | null
  title: string
  subtitle: string
  helper: string
  query: string
  onQueryChange: (value: string) => void
  selectedFriends: UsuarioSocial[]
  availableFriends: UsuarioSocial[]
  existingPlayers?: JogoParticipante[]
  maxSelectable: number
  confirmLabel: string
  canSubmit: boolean
  submitting: boolean
  gameType?: "SIMPLES" | "DUPLA"
  onGameTypeChange?: (value: "SIMPLES" | "DUPLA") => void
  onAddFriend: (userId: string) => void
  onRemoveFriend: (userId: string) => void
  onConfirm: () => void
  onCancel: () => void
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
}

export function InvitePlayersPanel({
  mode,
  title,
  subtitle,
  helper,
  query,
  onQueryChange,
  selectedFriends,
  availableFriends,
  existingPlayers = [],
  maxSelectable,
  confirmLabel,
  canSubmit,
  submitting,
  gameType,
  onGameTypeChange,
  onAddFriend,
  onRemoveFriend,
  onConfirm,
  onCancel,
  secondaryActionLabel,
  onSecondaryAction,
}: InvitePlayersPanelProps) {
  if (!mode) {
    return (
      <section className="rounded-[28px] border border-dashed border-zinc-300 bg-white p-5 shadow-sm">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-zinc-400">
          Convites
        </p>
        <h3 className="mt-3 text-xl font-black text-zinc-950">Quem vai jogar?</h3>
        <p className="mt-2 text-sm leading-6 text-zinc-500">
          Escolha um horario livre ou um jogo aberto para montar a lista de convidados.
        </p>
      </section>
    )
  }

  return (
    <section className="rounded-[28px] border border-black/5 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-green-700">
            Convite rapido
          </p>
          <h3 className="mt-2 text-xl font-black text-zinc-950">{title}</h3>
          <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-zinc-200 text-zinc-500 transition hover:bg-zinc-50"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {mode === "create" && onGameTypeChange ? (
        <div className="mt-5 inline-flex rounded-2xl bg-zinc-100 p-1">
          {(["SIMPLES", "DUPLA"] as const).map((value) => {
            const active = gameType === value

            return (
              <button
                key={value}
                type="button"
                onClick={() => onGameTypeChange(value)}
                className={[
                  "rounded-[14px] px-4 py-2 text-sm font-bold transition",
                  active ? "bg-white text-green-700 shadow-sm" : "text-zinc-500",
                ].join(" ")}
              >
                {value === "SIMPLES" ? "Simples" : "Dupla"}
              </button>
            )
          })}
        </div>
      ) : null}

      {existingPlayers.length > 0 ? (
        <div className="mt-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">
            Jogadores atuais
          </p>
          <div className="mt-3 space-y-2">
            {existingPlayers.map((participante) => (
              <div
                key={participante.usuario.id}
                className="flex items-center gap-3 rounded-2xl bg-zinc-50 px-4 py-3"
              >
                <UserAvatar
                  name={participante.usuario.nome}
                  photo={participante.usuario.foto_perfil}
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-zinc-950">
                    {participante.usuario.nome}
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
                    {participante.papel}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-5">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">
          Escolha os jogadores
        </p>
        <p className="mt-1 text-sm text-zinc-500">{helper}</p>
      </div>

      <label className="mt-4 flex h-12 items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 transition focus-within:border-green-600 focus-within:bg-white">
        <Search className="h-4 w-4 text-zinc-400" />
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Digite o nome"
          className="w-full bg-transparent text-sm font-semibold text-zinc-900 outline-none placeholder:text-zinc-400"
        />
      </label>

      {selectedFriends.length > 0 ? (
        <div className="mt-5 space-y-2">
          {selectedFriends.map((friend) => (
            <div
              key={friend.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-green-100 bg-green-50 px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <UserAvatar name={friend.nome} photo={friend.foto_perfil ?? null} />
                <p className="truncate text-sm font-black text-zinc-950">{friend.nome}</p>
              </div>

              <button
                type="button"
                onClick={() => onRemoveFriend(friend.id)}
                className="text-sm font-bold text-red-600 transition hover:text-red-700"
              >
                Remover
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-5 space-y-2">
        {availableFriends.length > 0 ? (
          availableFriends.map((friend) => (
            <div
              key={friend.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => onAddFriend(friend.id)}
                  disabled={selectedFriends.length >= maxSelectable}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 transition hover:bg-green-100 hover:text-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <UserRoundPlus className="h-4 w-4" />
                </button>

                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-zinc-950">{friend.nome}</p>
                  <p className="text-xs font-semibold text-zinc-500">Amigo</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onAddFriend(friend.id)}
                disabled={selectedFriends.length >= maxSelectable}
                className="text-sm font-bold text-green-700 transition hover:text-green-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Adicionar
              </button>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-4 text-sm text-zinc-500">
            {query
              ? "Nenhum amigo encontrado com esse nome."
              : "Nenhum amigo disponivel para adicionar agora."}
          </div>
        )}
      </div>

      <div className="mt-5 space-y-2">
        <button
          type="button"
          onClick={onConfirm}
          disabled={!canSubmit || submitting}
          className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-green-700 px-4 text-sm font-black text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Confirmando..." : confirmLabel}
        </button>

        {secondaryActionLabel && onSecondaryAction ? (
          <button
            type="button"
            onClick={onSecondaryAction}
            className="inline-flex h-12 w-full items-center justify-center rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-bold text-zinc-700 transition hover:bg-zinc-50"
          >
            {secondaryActionLabel}
          </button>
        ) : null}

        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-12 w-full items-center justify-center rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-bold text-zinc-500 transition hover:bg-zinc-50"
        >
          Cancelar
        </button>
      </div>
    </section>
  )
}

function UserAvatar({
  name,
  photo,
}: {
  name?: string
  photo?: string | null
}) {
  if (photo) {
    return (
      <div
        aria-label={name || "Jogador"}
        className="h-10 w-10 rounded-full bg-zinc-200 bg-cover bg-center"
        role="img"
        style={{ backgroundImage: `url("${photo}")` }}
      />
    )
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-xs font-black text-zinc-700">
      {getInitials(name)}
    </div>
  )
}
