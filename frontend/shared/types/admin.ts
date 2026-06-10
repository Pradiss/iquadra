import type { PerfilUsuario, Usuario } from "./auth"

export type EmpresaUsuarioAdmin = {
  id: string
  perfil: PerfilUsuario
  status: Usuario["status"]
  limite_jogos_personalizado: number | null
  usuario: Usuario
}

export type ListEmpresaUsuariosResponse = {
  usuarios: EmpresaUsuarioAdmin[]
}

export type ListClientesResponse = {
  clientes: EmpresaUsuarioAdmin[]
}
