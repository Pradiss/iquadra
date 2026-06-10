export type StatusUsuario = "ATIVO" | "INATIVO" | "BLOQUEADO"

export type CategoriaUsuario = "A" | "B" | "C" | "D" | "INICIANTE"

export type PerfilAcademiaUsuario =
  | "PROFESSOR"
  | "FUNCIONARIO"
  | "ADMIN_ACADEMIA"
  | "DONO"

export type PerfilUsuario = PerfilAcademiaUsuario | "JOGADOR"

export type AcademiaResumo = {
  id: string
  nome: string
  slug: string
  telefone?: string | null
  email?: string | null
  endereco?: string | null
  cidade?: string | null
  estado?: string | null
  cep?: string | null
  status?: StatusUsuario | null
}

export type AcademiaUsuario = {
  id: string
  perfil: PerfilAcademiaUsuario
  status: StatusUsuario
  limite_jogos_personalizado: number | null
  academia: AcademiaResumo
}

export type Usuario = {
  id: string
  nome: string
  email: string
  telefone: string
  foto_perfil?: string | null
  status: StatusUsuario
  categoria?: CategoriaUsuario | null
  cidade?: string | null
  cep?: string | null
  bio?: string | null
  especialidades?: string | null
  temPerfilCliente: boolean
  temPerfilProfessor: boolean
  academias: AcademiaUsuario[]
}

export type AuthResponse = {
  token: string
  usuario: Usuario
}

export type AuthSessionSnapshot = {
  usuario: Usuario
  academiaAtual: AcademiaResumo | null
  perfilAtual: PerfilUsuario
  vinculoAtualId: string | null
}
