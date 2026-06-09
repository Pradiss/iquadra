"use client"

import axios from "axios"
import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  CATEGORIAS_USUARIO,
  isCategoriaUsuario,
  type CategoriaUsuario,
} from "../../lib/categoria-usuario"
import { maskCep, maskPhone, onlyNumbers } from "../../lib/masks"
import { register, type RegisterData } from "../../services/auth.service"

type CadastroData = {
  nome: string
  telefone: string
  cidade: string
  cep: string
  categoria: CategoriaUsuario | ""
  email: string
  senha: string
}

const initialData: CadastroData = {
  nome: "",
  telefone: "",
  cidade: "",
  cep: "",
  categoria: "",
  email: "",
  senha: "",
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function getCategoriaLabel(categoria: CategoriaUsuario) {
  return categoria === "INICIANTE" ? "Iniciante" : categoria
}

function cleanPayload(data: CadastroData): RegisterData {
  if (!isCategoriaUsuario(data.categoria)) {
    throw new Error("Categoria invalida")
  }

  return {
    nome: data.nome.trim(),
    email: data.email.trim().toLowerCase(),
    telefone: onlyNumbers(data.telefone),
    categoria: data.categoria,
    cidade: data.cidade.trim(),
    cep: onlyNumbers(data.cep),
    senha: data.senha,
  }
}

export function CadastroForm() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState("")
  const [data, setData] = useState<CadastroData>(initialData)

  function updateField<K extends keyof CadastroData>(
    field: K,
    value: CadastroData[K]
  ) {
    setData((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function validateStep() {
    if (step === 1) {
      if (data.nome.trim().length < 3) return "Informe seu nome completo."
      if (onlyNumbers(data.telefone).length < 10) return "Informe um telefone valido."
      if (data.cidade.trim().length < 2) return "Informe sua cidade."
      if (onlyNumbers(data.cep).length !== 8) return "Informe um CEP valido."
    }

    if (step === 2 && !data.categoria) return "Informe sua categoria."

    if (step === 3) {
      if (!isValidEmail(data.email)) return "Informe um e-mail valido."
      if (data.senha.length < 6) return "A senha precisa ter pelo menos 6 caracteres."
    }

    return ""
  }

  function nextStep() {
    const error = validateStep()

    if (error) {
      setErro(error)
      return
    }

    setErro("")
    setStep((current) => current + 1)
  }

  function previousStep() {
    setErro("")
    setStep((current) => current - 1)
  }

  async function handleSubmit() {
    const error = validateStep()

    if (error) {
      setErro(error)
      return
    }

    setErro("")
    setLoading(true)

    try {
      await register(cleanPayload(data))
      router.push("/login?created=jogador")
    } catch (error) {
      if (axios.isAxiosError<{ message?: string }>(error)) {
        setErro(error.response?.data?.message ?? "Nao foi possivel criar sua conta.")
      } else {
        setErro("Nao foi possivel criar sua conta.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-[420px] rounded-2xl bg-white px-5 py-8 shadow-2xl sm:px-8 sm:py-10 md:px-10 md:py-12">
      <div className="mb-6 text-center sm:mb-8">
        <Image
          src="/logo.png"
          alt="IQuadra"
          width={124}
          height={32}
          className="mx-auto mb-4 h-8 w-auto"
        />

        <h1 className="text-[28px] font-semibold tracking-tight text-gray-900 sm:text-[32px]">
          Criar conta
        </h1>

        <p className="mt-1 text-[13px] font-light text-gray-400 sm:text-[14px]">
          Etapa {step} de 3
        </p>
      </div>

      <div className="mb-6 flex gap-1.5 sm:mb-8">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className={`h-[3px] flex-1 rounded-full transition-colors duration-300 ${
              item <= step ? "bg-gray-900" : "bg-black/10"
            }`}
          />
        ))}
      </div>

      {erro && (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {erro}
        </p>
      )}

      <div className="flex flex-col gap-3">
        {step === 1 && (
          <>
            <Input
              label="Nome"
              value={data.nome}
              autoComplete="name"
              onChange={(value) => updateField("nome", value)}
            />

            <Input
              label="Telefone"
              value={data.telefone}
              inputMode="numeric"
              autoComplete="tel"
              onChange={(value) => updateField("telefone", maskPhone(value))}
            />

            <Input
              label="Cidade"
              value={data.cidade}
              onChange={(value) => updateField("cidade", value)}
            />

            <Input
              label="CEP"
              value={data.cep}
              inputMode="numeric"
              onChange={(value) => updateField("cep", maskCep(value))}
            />
          </>
        )}

        {step === 2 && (
          <SelectInput
            label="Categoria"
            value={data.categoria}
            options={CATEGORIAS_USUARIO}
            onChange={(value) => updateField("categoria", value)}
          />
        )}

        {step === 3 && (
          <>
            <Input
              label="E-mail"
              type="email"
              value={data.email}
              inputMode="email"
              autoComplete="email"
              onChange={(value) => updateField("email", value)}
            />

            <Input
              label="Senha"
              type="password"
              value={data.senha}
              autoComplete="new-password"
              onChange={(value) => updateField("senha", value)}
            />
          </>
        )}

        <div className="mt-1 flex gap-3">
          {step > 1 && (
            <button
              type="button"
              onClick={previousStep}
              className="h-[50px] w-full rounded-xl border border-black/10 bg-white text-[15px] font-semibold text-gray-700 transition-all hover:bg-gray-50"
            >
              Voltar
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              className="h-[50px] w-full rounded-xl bg-gray-900 text-[15px] font-semibold text-white transition-all hover:bg-black"
            >
              Proximo
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={handleSubmit}
              className="h-[50px] w-full rounded-xl bg-gray-900 text-[15px] font-semibold text-white transition-all hover:bg-black disabled:opacity-60"
            >
              {loading ? "Criando..." : "Criar conta"}
            </button>
          )}
        </div>
      </div>

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
  inputMode?: "text" | "numeric" | "decimal" | "tel" | "search" | "email" | "url"
  autoComplete?: string
  onChange: (value: string) => void
}

function Input({
  label,
  type = "text",
  value,
  inputMode,
  autoComplete,
  onChange,
}: InputProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-gray-700">
        {label}
      </span>

      <input
        type={type}
        value={value}
        inputMode={inputMode}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        className="h-[50px] w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-[15px] text-gray-900 outline-none transition focus:border-green-600 focus:bg-white"
      />
    </label>
  )
}

type SelectInputProps = {
  label: string
  value: CategoriaUsuario | ""
  options: readonly CategoriaUsuario[]
  onChange: (value: CategoriaUsuario | "") => void
}

function SelectInput({
  label,
  value,
  options,
  onChange,
}: SelectInputProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-gray-700">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) => {
          const nextValue = event.target.value
          onChange(isCategoriaUsuario(nextValue) ? nextValue : "")
        }}
        className="h-[50px] w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-[15px] text-gray-900 outline-none transition focus:border-green-600 focus:bg-white"
      >
        <option value="" disabled>
          Selecione
        </option>

        {options.map((categoria) => (
          <option key={categoria} value={categoria}>
            {getCategoriaLabel(categoria)}
          </option>
        ))}
      </select>
    </label>
  )
}
