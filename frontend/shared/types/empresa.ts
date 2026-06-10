import type { QuadraResumo } from "./quadra"

export type EmpresaMarketplace = {
  id: string
  nome: string
  slug: string
  telefone?: string | null
  email?: string | null
  endereco?: string | null
  cidade?: string | null
  estado?: string | null
  cep?: string | null
  totalQuadras: number
  quadrasCobertas: number
  quadrasDescobertas: number
  tiposPiso: string[]
  agendaPronta: boolean
}

export type EmpresasMarketplaceResponse = {
  empresas: EmpresaMarketplace[]
}

export type EmpresaQuadraDetalhe = QuadraResumo

export type EmpresaDetalhe = EmpresaMarketplace & {
  quadras: EmpresaQuadraDetalhe[]
}

export type EmpresaDetalheResponse = {
  empresa: EmpresaDetalhe
}
