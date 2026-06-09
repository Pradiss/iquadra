"use client"

import axios from "axios"
import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { login } from "../../services/auth.service"
import { completeAuthFlow } from "../../lib/auth-session"

function getSuccessMessage(created?: string | null) {
  if (created === "jogador") {
    return "Conta criada com sucesso. Agora e so entrar."
  }

  if (created === "professor") {
    return "Cadastro de professor criado. Entre para continuar."
  }

  if (created === "academia") {
    return "Academia cadastrada. Entre com o e-mail e a senha que voce acabou de criar."
  }

  return ""
}

export function LoginForm({ created }: { created?: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState("")

  const successMessage = getSuccessMessage(created)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErro("")
    setLoading(true)

    const formData = new FormData(event.currentTarget)

    try {
      const response = await login({
        email: String(formData.get("email")),
        senha: String(formData.get("senha")),
      })

      const { redirectTo } = await completeAuthFlow(response)
      router.push(redirectTo)
    } catch (error) {
      if (axios.isAxiosError<{ message?: string }>(error)) {
        setErro(error.response?.data?.message ?? "Nao foi possivel entrar agora.")
      } else {
        setErro("Nao foi possivel entrar agora.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-[420px] rounded-[30px] bg-white px-5 py-8 shadow-[0_26px_90px_rgba(4,12,24,0.22)] sm:px-8 sm:py-10 md:px-10 md:py-12">
      <div className="mb-8 text-center">
        <Image
          src="/logo.png"
          alt="IQuadra"
          width={124}
          height={32}
          className="mx-auto mb-4 h-8 w-auto"
        />

        <h1 className="text-[32px] font-semibold tracking-tight text-gray-900">
          Bora pro Play!
        </h1>

        <p className="mt-2 text-[14px] font-light text-gray-400">
          Acesse sua conta para reservar quadras, participar dos jogos e acompanhar
          a sua academia.
        </p>
      </div>

      {successMessage && (
        <p className="mb-4 rounded-xl bg-lime-50 px-4 py-3 text-sm font-medium text-lime-700">
          {successMessage}
        </p>
      )}

      {erro && (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {erro}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input name="email" label="E-mail" type="email" />
        <Input name="senha" label="Senha" type="password" />

        <button
          disabled={loading}
          className="mt-1 h-[50px] w-full rounded-xl bg-gray-900 text-[15px] font-semibold text-white transition hover:bg-black disabled:opacity-60"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p className="mt-7 text-center text-[13px] text-gray-400">
        Ainda nao tem uma conta?{" "}
        <button
          type="button"
          onClick={() => router.push("/cadastro")}
          className="font-semibold text-gray-700 hover:underline"
        >
          Criar conta
        </button>
      </p>

      <button
        type="button"
        onClick={() => router.push("/cadastro-professor")}
        className="mt-3 w-full rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-900 hover:bg-sky-100"
      >
        Sou professor e quero criar meu cadastro
      </button>

      <button
        type="button"
        onClick={() => router.push("/cadastro-empresa")}
        className="mt-3 w-full rounded-2xl border border-lime-200 bg-lime-50 px-4 py-3 text-sm font-semibold text-lime-900 hover:bg-lime-100"
      >
        Administra uma academia? Criar acesso de proprietario
      </button>
    </div>
  )
}

type InputProps = {
  name: string
  label: string
  type?: string
}

function Input({ name, label, type = "text" }: InputProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-gray-700">
        {label}
      </span>

      <input
        name={name}
        type={type}
        className="h-[50px] w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-[15px] text-gray-900 outline-none transition focus:border-green-600 focus:bg-white"
      />
    </label>
  )
}
