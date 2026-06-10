"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import type { LucideIcon } from "lucide-react"
import {
  ChevronRight,
  Clock3,
  Mail,
  MapPin,
  PencilLine,
  ShieldCheck,
  Trophy,
  UserRoundPlus,
} from "lucide-react"

import { clearAuthStorage, getSession, getToken } from "@/shared/lib/auth-storage"
import { getErrorMessage, getInitials, isUnauthorizedError } from "@/shared/lib/painel-format"
import { getPerfilLabel } from "@/shared/lib/perfis"
import { isPendingIncoming, isPendingOutgoing } from "@/shared/lib/social"
import { listarAmizades } from "@/shared/services/amizade.service"

import type { AuthSessionSnapshot } from "@/shared/types/auth"
import type { Amizade } from "@/shared/types/social"

type Message = {
  tone: "error" | "info"
  text: string
}

type Metric = {
  label: string
  value: string
}

type MenuItemData = {
  icon: LucideIcon
  label: string
  badge?: number
  onClick?: () => void
}

export function PerfilBoard() {
  const router = useRouter()

  const [session] = useState<AuthSessionSnapshot | null>(() => getSession())
  const [amizades, setAmizades] = useState<Amizade[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<Message | null>(null)

  useEffect(() => {
    const token = getToken()

    if (!token || !session) {
      clearAuthStorage()
      router.replace("/login")
      return
    }

    let active = true

    async function carregarAmizades() {
      try {
        const response = await listarAmizades()

        if (active) {
          setAmizades(response.amizades)
        }
      } catch (requestError) {
        if (isUnauthorizedError(requestError)) {
          clearAuthStorage()
          router.replace("/login")
          return
        }

        if (active) {
          setMessage({
            tone: "error",
            text: getErrorMessage(requestError, "Nao foi possivel carregar suas amizades."),
          })
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void carregarAmizades()

    return () => {
      active = false
    }
  }, [router, session])

  const dados = useMemo(() => {
    if (!session) {
      return null
    }

    const { usuario } = session
    const amigos = amizades.filter((amizade) => amizade.status === "ACEITA")
    const pedidosRecebidos = amizades.filter((amizade) =>
      isPendingIncoming(amizade, usuario.id)
    )
    const pedidosEnviados = amizades.filter((amizade) =>
      isPendingOutgoing(amizade, usuario.id)
    )

    return {
      usuario,
      perfilAtual: getPerfilLabel(session.perfilAtual),
      amigos,
      pedidosRecebidos,
      pedidosEnviados,
    }
  }, [amizades, session])

  function editarPerfil() {
    setMessage({
      tone: "info",
      text: "Botao de editar perfil pronto para conectar ao formulario quando voce quiser.",
    })
  }

  if (!dados) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <p className="text-sm font-bold text-zinc-500">Carregando perfil...</p>
      </main>
    )
  }

  const { usuario, perfilAtual, amigos, pedidosRecebidos, pedidosEnviados } = dados
  const totalPendentes = pedidosRecebidos.length + pedidosEnviados.length

  const metricas: Metric[] = [
    { label: "Perfil", value: perfilAtual },
    { label: "Nivel", value: usuario.categoria || "Nao informado" },
    { label: "Amigos", value: String(amigos.length) },
    { label: "Pendentes", value: String(totalPendentes) },
  ]

  const atalhos: MenuItemData[] = [
    { icon: ShieldCheck, label: perfilAtual },
    {
      icon: Trophy,
      label: "Meus jogos",
      onClick: () => router.push("/painel/meus-jogos"),
    },
    {
      icon: UserRoundPlus,
      label: "Amigos",
      badge: amigos.length,
    },
    {
      icon: Clock3,
      label: "Pedidos recebidos",
      badge: pedidosRecebidos.length,
    },
    {
      icon: Mail,
      label: "Pedidos enviados",
      badge: pedidosEnviados.length,
    },
  ]

  return (
    <main className="px-4 py-6 sm:px-6">
      <section className="mx-auto ">
       

        {message ? (
          <div
            className={[
              "mt-4 rounded-2xl px-4 py-3 text-sm font-bold",
              message.tone === "error"
                ? "bg-red-50 text-red-600"
                : "bg-green-50 text-green-700",
            ].join(" ")}
          >
            {message.text}
          </div>
        ) : null}

        <div className="mt-5 grid gap-5 lg:grid-cols-[320px_1fr]">
          <section className="rounded-[28px] bg-[linear-gradient(160deg,#0f5132_0%,#198754_55%,#d6f5b0_100%)] p-5 text-white">
            <div className="flex items-start justify-between gap-3">
              <Avatar nome={usuario.nome} size="lg" />

              <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-white">
                {usuario.status || "ATIVO"}
              </span>
            </div>

            <h1 className="mt-4 text-2xl font-black tracking-tight">
              {usuario.nome || "Usuario IQuadra"}
            </h1>

            <p className="mt-2 flex items-center gap-2 text-sm text-white/85">
              <MapPin className="h-4 w-4 shrink-0" />
              {usuario.cidade || "Cidade nao informada"}
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <PrimaryButton
                icon={<PencilLine className="h-4 w-4" />}
                label="Editar perfil"
                onClick={editarPerfil}
              />
              <SecondaryButton
                icon={<Trophy className="h-4 w-4" />}
                label="Meus jogos"
                onClick={() => router.push("/painel/meus-jogos")}
              />
            </div>
          </section>

          <div className="space-y-5">
            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {metricas.map((item) => (
                <MetricCard key={item.label} {...item} />
              ))}
            </section>

            
            <section className="rounded-[28px] border border-zinc-200 bg-slate-50 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black text-zinc-950">Atalhos</h2>
                  <p className="text-sm text-zinc-500">
                    Menos informacao e acesso rapido ao que importa.
                  </p>
                </div>

                {loading ? (
                  <span className="text-xs font-bold text-zinc-400">Carregando...</span>
                ) : null}
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {atalhos.map((item) => (
                  <MenuItem key={item.label} {...item} />
                ))}
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  )
}

function Avatar({ nome, size }: { nome?: string; size: "lg" | "sm" }) {
  const classes =
    size === "lg"
      ? "h-20 w-20 border-4 text-2xl shadow-lg"
      : "h-10 w-10 border-2 text-sm"

  return (
    <div
      className={[
        "flex items-center justify-center rounded-full border-white/70 bg-white/15 font-black text-white",
        classes,
      ].join(" ")}
    >
      {getInitials(nome)}
    </div>
  )
}

function MetricCard({ label, value }: Metric) {
  return (
    <article className="rounded-[22px] border border-zinc-200 bg-slate-50 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </p>
      <p className="mt-2 text-lg font-black text-zinc-950">{value}</p>
    </article>
  )
}

function MenuItem({ icon: Icon, label, badge, onClick }: MenuItemData) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-14 w-full items-center gap-3 rounded-[22px] border border-zinc-200 bg-white px-4 py-3 text-left text-sm font-semibold text-zinc-800 transition hover:border-zinc-300 hover:bg-zinc-50"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-700">
        <Icon className="h-5 w-5" />
      </span>

      <span className="min-w-0 flex-1 truncate">{label}</span>

      {badge !== undefined ? (
        <span className="rounded-full bg-zinc-950 px-2.5 py-1 text-xs font-black text-white">
          {badge}
        </span>
      ) : (
        <ChevronRight className="h-4 w-4 text-zinc-400" />
      )}
    </button>
  )
}

function PrimaryButton({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-4 text-sm font-black text-green-800 transition hover:bg-white/90"
    >
      {icon}
      {label}
    </button>
  )
}

function SecondaryButton({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 text-sm font-black text-white transition hover:bg-white/15"
    >
      {icon}
      {label}
    </button>
  )
}
