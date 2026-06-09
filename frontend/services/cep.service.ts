import { onlyNumbers } from "../lib/masks"

type ViaCepResponse = {
  cep?: string
  logradouro?: string
  bairro?: string
  localidade?: string
  uf?: string
  erro?: true
}

export type CepLookupResult = {
  cep: string
  endereco: string
  cidade: string
  estado: string
}

export async function lookupCep(rawCep: string): Promise<CepLookupResult> {
  const cep = onlyNumbers(rawCep)

  if (cep.length !== 8) {
    throw new Error("Informe um CEP com 8 digitos.")
  }

  const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error("Nao foi possivel consultar o CEP agora.")
  }

  const data = (await response.json()) as ViaCepResponse

  if (data.erro) {
    throw new Error("CEP nao encontrado.")
  }

  return {
    cep: data.cep ?? cep,
    endereco: [data.logradouro, data.bairro].filter(Boolean).join(" - "),
    cidade: data.localidade ?? "",
    estado: data.uf ?? "",
  }
}
