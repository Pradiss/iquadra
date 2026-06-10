import { api, unwrapData, unwrapList } from "./api"
import type {
  EmpresaDetalhe,
  EmpresaDetalheResponse,
  EmpresaMarketplace,
  EmpresasMarketplaceResponse,
} from "../types/empresa"
import type { QuadraResumo } from "../types/quadra"
import type { AcademiaResumo, StatusUsuario } from "../types/auth"

type RawAcademia = AcademiaResumo & {
  status: StatusUsuario
}

function toMarketplace(academia: RawAcademia, quadras: QuadraResumo[]): EmpresaMarketplace {
  const tiposPiso = Array.from(new Set(quadras.map((quadra) => quadra.tipo_piso)))

  return {
    id: academia.id,
    nome: academia.nome,
    slug: academia.slug,
    telefone: academia.telefone ?? null,
    email: academia.email ?? null,
    endereco: academia.endereco ?? null,
    cidade: academia.cidade ?? null,
    estado: academia.estado ?? null,
    totalQuadras: quadras.length,
    quadrasCobertas: quadras.filter((quadra) => quadra.coberta).length,
    quadrasDescobertas: quadras.filter((quadra) => !quadra.coberta).length,
    tiposPiso,
    agendaPronta: quadras.length > 0,
  }
}

async function buscarQuadrasDaAcademia(academiaId: string) {
  const response = await api.get(`/academias/${academiaId}/quadras`)
  return unwrapList<QuadraResumo>(response)
}

export async function listarEmpresas(): Promise<EmpresasMarketplaceResponse> {
  const response = await api.get("/academias")
  const academias = unwrapList<RawAcademia>(response)

  const empresas = await Promise.all(
    academias.map(async (academia) => {
      const quadras = await buscarQuadrasDaAcademia(academia.id)
      return toMarketplace(academia, quadras)
    })
  )

  return { empresas }
}

export async function buscarEmpresaDetalhes(
  empresaId: string
): Promise<EmpresaDetalheResponse> {
  const [academiaResponse, quadras] = await Promise.all([
    api.get(`/academias/${empresaId}`),
    buscarQuadrasDaAcademia(empresaId),
  ])

  const academia = unwrapData<RawAcademia>(academiaResponse)
  const marketplace = toMarketplace(academia, quadras)

  const empresa: EmpresaDetalhe = {
    ...marketplace,
    cep: academia.cep ?? null,
    quadras,
  }

  return { empresa }
}
