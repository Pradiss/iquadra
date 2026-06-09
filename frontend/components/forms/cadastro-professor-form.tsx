"use client"

import axios from "axios"
import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { registerProfessor } from "../../services/auth.service"
import { maskPhone, onlyNumbers } from "../../lib/masks"

type ProfessorData = {
  nome: string
  telefone: string
  cidade: string
  bio: string
  especialidades: string
  email: string
  senha: string
}

const initialData: ProfessorData = {
  nome: "",
  telefone: "",
  cidade: "",
  bio: "",
  especialidades: "",
  email: "",
  senha: "",
}

export function CadastroProfessorForm() {
  const router = useRouter()
  const [data, setData] = useState(initialData)
  const [erro, setErro] = useState("")
  const [loading, setLoading] = useState(false)

  function updateField(field: keyof ProfessorData, value: string) {
    setData((current) => ({
      ...current,
      [field]: value,
    }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErro("")
    setLoading(true)

    try {
      await registerProfessor({
        nome: data.nome.trim(),
        email: data.email.trim().toLowerCase(),
        telefone: onlyNumbers(data.telefone),
        senha: data.senha,
        cidade: data.cidade.trim() || undefined,
        bio: data.bio.trim() || undefined,
        especialidades: data.especialidades.trim() || undefined,
      })

      router.push("/login?created=professor")
    } catch (error) {
      if (axios.isAxiosError<{ message?: string }>(error)) {
        setErro(
          error.response?.data?.message ??
            "Nao foi possivel criar o cadastro de professor."
        )
      } else {
        setErro("Nao foi possivel criar o cadastro de professor.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-[460px] rounded-2xl bg-white px-5 py-8 shadow-2xl sm:px-8 sm:py-10">
      <div className="mb-6 text-center">
        <Image
          src="/logo.png"
          alt="IQuadra"
          width={124}
          height={32}
          className="mx-auto mb-4 h-8 w-auto"
        />

        <h1 className="text-[28px] font-semibold text-gray-900">
          Cadastro de professor
        </h1>

        <p className="mt-1 text-sm text-gray-400">
          Crie sua conta e depois vincule seu perfil a uma academia para liberar a agenda.
        </p>
      </div>

      {erro && (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {erro}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input
          label="Nome"
          value={data.nome}
          onChange={(value) => updateField("nome", value)}
        />

        <Input
          label="Telefone"
          value={data.telefone}
          onChange={(value) => updateField("telefone", maskPhone(value))}
        />

        <Input
          label="Cidade"
          value={data.cidade}
          onChange={(value) => updateField("cidade", value)}
        />

        <Textarea
          label="Bio"
          value={data.bio}
          onChange={(value) => updateField("bio", value)}
        />

        <Input
          label="Especialidades"
          value={data.especialidades}
          onChange={(value) => updateField("especialidades", value)}
        />

        <Input
          label="E-mail"
          type="email"
          value={data.email}
          onChange={(value) => updateField("email", value)}
        />

        <Input
          label="Senha"
          type="password"
          value={data.senha}
          onChange={(value) => updateField("senha", value)}
        />

        <button
          disabled={loading}
          className="mt-2 h-[50px] rounded-xl bg-gray-900 font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Criando..." : "Criar cadastro"}
        </button>
      </form>

       <p className="mt-6 text-center text-[13px] text-gray-400 sm:mt-7">
        Ja tem uma conta?{" "}
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="font-semibold text-gray-700 hover:underline"
        >
          Entrar
        </button>
      </p>
    </div>
  )
}

type InputProps = {
  label: string
  type?: string
  value: string
  onChange: (value: string) => void
}

function Input({ label, type = "text", value, onChange }: InputProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-gray-700">
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-[50px] w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-[15px] text-gray-900 outline-none focus:border-green-600 focus:bg-white"
      />
    </label>
  )
}

function Textarea({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-gray-700">
        {label}
      </span>

      <textarea
        rows={4}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[15px] text-gray-900 outline-none focus:border-green-600 focus:bg-white"
      />
    </label>
  )
}
