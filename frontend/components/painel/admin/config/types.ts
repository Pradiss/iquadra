import type {
  AcademiaUsuarioLogado,
  UsuarioLogado,
} from "@/lib/auth-storage";
import type { DuracaoReserva } from "@/services/academia.service";

export type AbaConfig = "perfil" | "academia";

export type AdminContext = {
  usuario: UsuarioLogado;
  vinculo: AcademiaUsuarioLogado;
  academiaId: string;
  isDono: boolean;
};

export type PerfilForm = {
  nome: string;
  email: string;
  telefone: string;
  foto_perfil: string;
  fotoUrl: string;
};

export type AcademiaForm = {
  nome: string;
  slug: string;
  cnpj: string;
  telefone: string;
  email: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  logo_url: string;
  duracoes_reserva_minutos: DuracaoReserva[];
};
