import { api, unwrapData } from "./api"
import type {
  AcademiaResumo,
  AcademiaUsuario,
  AuthResponse,
  CategoriaUsuario,
  StatusUsuario,
  Usuario,
} from "../types/auth"

type RawPerfilCliente = {
  categoria: CategoriaUsuario
  cidade: string
  cep: string
}

type RawPerfilProfessor = {
  bio?: string | null
  especialidades?: string | null
  cidade?: string | null
}

type RawAcademia = AcademiaResumo & {
  status: StatusUsuario
}

type RawAcademiaUsuario = {
  id: string
  perfil: AcademiaUsuario["perfil"]
  status: StatusUsuario
  limite_jogos_personalizado: number | null
  academia: RawAcademia
}

type RawUsuario = {
  id: string
  nome: string
  email: string
  telefone: string
  foto_perfil?: string | null
  status: StatusUsuario
  perfil_cliente?: RawPerfilCliente | null
  perfil_professor?: RawPerfilProfessor | null
  academias?: RawAcademiaUsuario[]
}

type RawLoginResponse = {
  token: string
  usuario: RawUsuario
}

export type RegisterData = {
  nome: string
  email: string
  telefone: string
  categoria: CategoriaUsuario
  cidade: string
  cep: string
  senha: string
}

export type RegisterProfessorData = {
  nome: string
  email: string
  telefone: string
  senha: string
  cidade?: string
  bio?: string
  especialidades?: string
}

export type RegisterEmpresaData = {
  nome_dono: string
  email: string
  telefone: string
  senha: string
  nome_academia: string
  slug: string
  cnpj?: string
  endereco?: string
  cidade?: string
  estado?: string
  cep?: string
}

function normalizeAcademia(academia: RawAcademia): AcademiaResumo {
  return {
    id: academia.id,
    nome: academia.nome,
    slug: academia.slug,
    telefone: academia.telefone ?? null,
    email: academia.email ?? null,
    endereco: academia.endereco ?? null,
    cidade: academia.cidade ?? null,
    estado: academia.estado ?? null,
    cep: academia.cep ?? null,
    status: academia.status,
  }
}

function normalizeUsuario(usuario: RawUsuario): Usuario {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    telefone: usuario.telefone,
    foto_perfil: usuario.foto_perfil ?? null,
    status: usuario.status,
    categoria: usuario.perfil_cliente?.categoria ?? null,
    cidade:
      usuario.perfil_cliente?.cidade ??
      usuario.perfil_professor?.cidade ??
      null,
    cep: usuario.perfil_cliente?.cep ?? null,
    bio: usuario.perfil_professor?.bio ?? null,
    especialidades: usuario.perfil_professor?.especialidades ?? null,
    temPerfilCliente: Boolean(usuario.perfil_cliente),
    temPerfilProfessor: Boolean(usuario.perfil_professor),
    academias: (usuario.academias ?? []).map((academiaUsuario) => ({
      id: academiaUsuario.id,
      perfil: academiaUsuario.perfil,
      status: academiaUsuario.status,
      limite_jogos_personalizado:
        academiaUsuario.limite_jogos_personalizado ?? null,
      academia: normalizeAcademia(academiaUsuario.academia),
    })),
  }
}

export async function register(data: RegisterData) {
  const response = await api.post("/auth/register/cliente", data)
  return response.data
}

export async function registerProfessor(data: RegisterProfessorData) {
  const response = await api.post("/auth/register/professor", data)
  return response.data
}

export async function registerEmpresa(data: RegisterEmpresaData) {
  const response = await api.post("/auth/register/academia", data)
  return response.data
}

export async function login(data: { email: string; senha: string }) {
  const response = await api.post("/auth/login", data)
  const result = unwrapData<RawLoginResponse>(response)

  const authResponse: AuthResponse = {
    token: result.token,
    usuario: normalizeUsuario(result.usuario),
  }

  return authResponse
}

export async function validateToken() {
  const response = await api.get("/users/me")
  return response.data
}
