"use client"

import { useEffect, useState, type ElementType, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import {
  Check,
  Clock3,
  LogOut,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Trophy,
  User,
  UserRoundPlus,
  X,
} from "lucide-react"
import { clearAuthStorage, getSession, getToken } from "../../../lib/auth-storage"
import { getInitials, getErrorMessage, isUnauthorizedError } from "../../../lib/painel-format"
import {
  getOutroUsuarioDaAmizade,
  isPendingIncoming,
  isPendingOutgoing,
} from "../../../lib/social"
import { getPerfilLabel } from "../../../lib/perfis"
import {
  aceitarAmizade,
  listarAmizades,
  recusarAmizade,
  removerAmizade,
} from "../../../services/amizade.service"
import type { AuthSessionSnapshot } from "../../../types/auth"
import type { Amizade } from "../../../types/social"

export default function PerfilPage() {
  const router = useRouter()
  const [session] = useState<AuthSessionSnapshot | null>(() => getSession())
  const [amizades, setAmizades] = useState<Amizade[]>([])
  const [loadingSocial, setLoadingSocial] = useState(true)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [busyAmizadeId, setBusyAmizadeId] = useState<string | null>(null)

  useEffect(() => {
    const token = getToken()

    if (!token || !session) {
      clearAuthStorage()
      router.replace("/login")
      return
    }

    async function loadSocial() {
      setError("")

      try {
        const response = await listarAmizades()
        setAmizades(response.amizades)
      } catch (requestError) {
        if (isUnauthorizedError(requestError)) {
          clearAuthStorage()
          router.replace("/login")
          return
        }

        setError(getErrorMessage(requestError, "Nao foi possivel carregar suas amizades."))
      } finally {
        setLoadingSocial(false)
      }
    }

    void loadSocial()
  }, [router, session])

  function handleLogout() {
    clearAuthStorage()
    router.push("/login")
  }

  async function handleSocialAction(
    amizadeId: string,
    action: "aceitar" | "recusar" | "remover"
  ) {
    setBusyAmizadeId(amizadeId)
    setError("")
    setNotice("")

    try {
      if (action === "aceitar") {
        await aceitarAmizade(amizadeId)
        setNotice("Pedido aceito com sucesso.")
      } else if (action === "recusar") {
        await recusarAmizade(amizadeId)
        setNotice("Pedido recusado com sucesso.")
      } else {
        await removerAmizade(amizadeId)
        setNotice("Amizade removida com sucesso.")
      }

      const response = await listarAmizades()
      setAmizades(response.amizades)
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Nao foi possivel concluir essa acao agora."))
    } finally {
      setBusyAmizadeId(null)
    }
  }

  if (!session) {
    return (
      <div className="rounded-[32px] bg-white p-6 shadow-sm">
        <p className="text-sm font-bold text-zinc-500">Carregando perfil...</p>
      </div>
    )
  }

  const usuario = session.usuario
  const perfilAtual = getPerfilLabel(session.perfilAtual)
  const amizadesAceitas = amizades.filter((amizade) => amizade.status === "ACEITA")
  const pedidosRecebidos = amizades.filter((amizade) =>
    isPendingIncoming(amizade, session.usuario.id)
  )
  const pedidosEnviados = amizades.filter((amizade) =>
    isPendingOutgoing(amizade, session.usuario.id)
  )

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5">
      <section className="overflow-hidden rounded-[36px] bg-white shadow-sm ring-1 ring-black/5">
        <div className="relative h-40 bg-gradient-to-br from-green-800 via-green-600 to-lime-400">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.4),transparent_35%)]" />
        </div>

        <div className="-mt-14 px-5 pb-6 sm:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex h-28 w-28 items-center justify-center rounded-full border-[6px] border-white bg-green-100 text-4xl font-black text-green-700 shadow-xl">
                {getInitials(usuario?.nome)}
              </div>

              <div className="pb-1">
                <h1 className="text-3xl font-black tracking-tight text-zinc-950">
                  {usuario?.nome || "Usuario IQuadra"}
                </h1>

                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-xs font-black text-green-700">
                  <ShieldCheck size={15} />
                  {perfilAtual}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-red-50 px-5 text-sm font-black text-red-600 transition hover:bg-red-100"
            >
              <LogOut size={18} />
              Sair da conta
            </button>
          </div>
        </div>
      </section>

      {(error || notice) && (
        <section
          className={[
            "rounded-[24px] px-5 py-4 text-sm font-semibold shadow-sm ring-1",
            error
              ? "bg-red-50 text-red-700 ring-red-200"
              : "bg-lime-50 text-lime-800 ring-lime-200",
          ].join(" ")}
        >
          {error || notice}
        </section>
      )}

      <section className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <div className="rounded-[36px] bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-8">
            <div className="border-b border-zinc-100 pb-6">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-green-700">
                Conta IQuadra
              </p>

              <h2 className="mt-2 text-2xl font-black tracking-tight text-zinc-950">
                Dados pessoais
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Informacoes carregadas da sessao autenticada.
              </p>
            </div>

            <div className="mt-7 grid gap-4 md:grid-cols-2">
              <Input icon={User} label="Nome" value={usuario?.nome || ""} />
              <Input icon={Mail} label="E-mail" value={usuario?.email || ""} />
              <Input icon={Phone} label="Telefone" value={usuario?.telefone || ""} />
              <Input icon={MapPin} label="Cidade" value={usuario?.cidade || ""} />
              <Input label="CEP" value={usuario?.cep || ""} />
              <Input icon={Trophy} label="Categoria" value={usuario?.categoria || ""} />
            </div>

            <div className="mt-8 border-t border-zinc-100 pt-6">
              <h3 className="text-lg font-black text-zinc-950">Academias disponiveis para voce</h3>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {usuario?.academias.length ? (
                  usuario.academias.map((academia) => (
                    <article
                      key={academia.id}
                      className="rounded-[24px] border border-zinc-200 bg-zinc-50 p-4"
                    >
                      <p className="text-lg font-black text-zinc-950">
                        {academia.academia.nome}
                      </p>
                      <p className="mt-1 text-sm text-zinc-500">
                        {academia.academia.cidade || "Cidade nao informada"}
                      </p>
                      <p className="mt-3 text-xs font-black uppercase tracking-[0.18em] text-green-700">
                        {getPerfilLabel(academia.perfil)}
                      </p>
                    </article>
                  ))
                ) : (
                  <div className="rounded-[24px] border border-dashed border-zinc-300 bg-zinc-50 px-4 py-5 text-sm text-zinc-500 md:col-span-2">
                    Nenhuma academia disponivel na sua conta ainda.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-[36px] bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-100 text-green-700">
                <UserRoundPlus className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight text-zinc-950">
                  Central social
                </h2>
                <p className="text-sm text-zinc-500">
                  Amizades aceitas, pedidos recebidos e convites enviados.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 xl:grid-cols-3">
              <SocialColumn
                title="Pedidos recebidos"
                emptyText="Nenhum pedido aguardando sua resposta."
                loading={loadingSocial}
              >
                {pedidosRecebidos.map((amizade) => {
                  const outroUsuario = getOutroUsuarioDaAmizade(amizade, session.usuario.id)

                  return (
                    <SocialCard
                      key={amizade.id}
                      title={outroUsuario.nome}
                      subtitle={outroUsuario.email}
                      actions={
                        <div className="flex gap-2">
                          <ActionButton
                            onClick={() => void handleSocialAction(amizade.id, "aceitar")}
                            icon={<Check className="h-4 w-4" />}
                            label="Aceitar"
                            disabled={busyAmizadeId === amizade.id}
                            variant="success"
                          />
                          <ActionButton
                            onClick={() => void handleSocialAction(amizade.id, "recusar")}
                            icon={<X className="h-4 w-4" />}
                            label="Recusar"
                            disabled={busyAmizadeId === amizade.id}
                          />
                        </div>
                      }
                    />
                  )
                })}
              </SocialColumn>

              <SocialColumn
                title="Pedidos enviados"
                emptyText="Voce ainda nao enviou pedidos visiveis no sistema."
                loading={loadingSocial}
              >
                {pedidosEnviados.map((amizade) => {
                  const outroUsuario = getOutroUsuarioDaAmizade(amizade, session.usuario.id)

                  return (
                    <SocialCard
                      key={amizade.id}
                      title={outroUsuario.nome}
                      subtitle="Aguardando resposta"
                    />
                  )
                })}
              </SocialColumn>

              <SocialColumn
                title="Amizades aceitas"
                emptyText="Quando alguem aceitar seu pedido, aparece aqui."
                loading={loadingSocial}
              >
                {amizadesAceitas.map((amizade) => {
                  const outroUsuario = getOutroUsuarioDaAmizade(amizade, session.usuario.id)

                  return (
                    <SocialCard
                      key={amizade.id}
                      title={outroUsuario.nome}
                      subtitle={outroUsuario.email}
                      actions={
                        <ActionButton
                          onClick={() => void handleSocialAction(amizade.id, "remover")}
                          icon={<X className="h-4 w-4" />}
                          label="Remover"
                          disabled={busyAmizadeId === amizade.id}
                        />
                      }
                    />
                  )
                })}
              </SocialColumn>
            </div>
          </div>
        </div>

        <aside className="space-y-5">
          <InfoCard title="Perfil atual" value={perfilAtual} />
          <InfoCard title="Status da conta" value={usuario?.status || "ATIVO"} />
          <InfoCard title="Acessos liberados" value={String(usuario?.academias.length ?? 0)} />
          <InfoCard title="Amigos aceitos" value={String(amizadesAceitas.length)} />
          <InfoCard title="Pedidos pendentes" value={String(pedidosRecebidos.length)} />
        </aside>
      </section>
    </div>
  )
}

function Input({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon?: ElementType
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-wide text-zinc-500">
        {label}
      </span>

      <div className="flex h-12 items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4">
        {Icon && <Icon size={18} className="text-green-700" />}

        <span className="w-full text-sm font-semibold text-zinc-900">
          {value || "Nao informado"}
        </span>
      </div>
    </label>
  )
}

function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[30px] bg-white p-5 shadow-sm ring-1 ring-black/5">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-zinc-400">
        {title}
      </p>
      <p className="mt-2 text-2xl font-black text-zinc-950">{value}</p>
    </div>
  )
}

function SocialColumn({
  title,
  loading,
  emptyText,
  children,
}: {
  title: string
  loading: boolean
  emptyText: string
  children: ReactNode
}) {
  const count = Array.isArray(children) ? children.length : children ? 1 : 0

  return (
    <div className="rounded-[28px] border border-zinc-200 bg-zinc-50 p-4">
      <div className="flex items-center gap-2">
        <Clock3 className="h-4 w-4 text-green-700" />
        <h3 className="text-sm font-black uppercase tracking-[0.18em] text-zinc-700">
          {title}
        </h3>
      </div>

      <div className="mt-4 space-y-3">
        {loading ? (
          <div className="text-sm font-semibold text-zinc-500">Carregando...</div>
        ) : count > 0 ? (
          children
        ) : (
          <div className="rounded-[20px] border border-dashed border-zinc-300 bg-white px-4 py-5 text-sm text-zinc-500">
            {emptyText}
          </div>
        )}
      </div>
    </div>
  )
}

function SocialCard({
  title,
  subtitle,
  actions,
}: {
  title: string
  subtitle: string
  actions?: ReactNode
}) {
  return (
    <article className="rounded-[22px] bg-white p-4 shadow-sm">
      <p className="font-black text-zinc-950">{title}</p>
      <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>

      {actions ? <div className="mt-4">{actions}</div> : null}
    </article>
  )
}

function ActionButton({
  label,
  onClick,
  icon,
  disabled,
  variant = "neutral",
}: {
  label: string
  onClick: () => void
  icon: React.ReactNode
  disabled?: boolean
  variant?: "neutral" | "success"
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold disabled:opacity-60",
        variant === "success"
          ? "bg-green-700 text-white hover:bg-green-800"
          : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200",
      ].join(" ")}
    >
      {icon}
      {label}
    </button>
  )
}
