export declare const StatusUsuario: {
    readonly ATIVO: "ATIVO";
    readonly INATIVO: "INATIVO";
    readonly BLOQUEADO: "BLOQUEADO";
};
export type StatusUsuario = (typeof StatusUsuario)[keyof typeof StatusUsuario];
export declare const PerfilAcademiaUsuario: {
    readonly PROFESSOR: "PROFESSOR";
    readonly FUNCIONARIO: "FUNCIONARIO";
    readonly ADMIN_ACADEMIA: "ADMIN_ACADEMIA";
    readonly DONO: "DONO";
};
export type PerfilAcademiaUsuario = (typeof PerfilAcademiaUsuario)[keyof typeof PerfilAcademiaUsuario];
export declare const CategoriaUsuario: {
    readonly A: "A";
    readonly B: "B";
    readonly C: "C";
    readonly D: "D";
    readonly INICIANTE: "INICIANTE";
};
export type CategoriaUsuario = (typeof CategoriaUsuario)[keyof typeof CategoriaUsuario];
export declare const TipoPiso: {
    readonly SAIBRO: "SAIBRO";
    readonly HARD: "HARD";
    readonly GRAMA: "GRAMA";
    readonly SINTETICA: "SINTETICA";
    readonly AREIA: "AREIA";
    readonly OUTRO: "OUTRO";
};
export type TipoPiso = (typeof TipoPiso)[keyof typeof TipoPiso];
export declare const TipoJogo: {
    readonly SIMPLES: "SIMPLES";
    readonly DUPLA: "DUPLA";
};
export type TipoJogo = (typeof TipoJogo)[keyof typeof TipoJogo];
export declare const StatusJogo: {
    readonly ABERTO: "ABERTO";
    readonly COMPLETO: "COMPLETO";
    readonly CANCELADO: "CANCELADO";
    readonly CONCLUIDO: "CONCLUIDO";
    readonly SEM_PARTICIPANTES: "SEM_PARTICIPANTES";
    readonly NAO_COMPARECEU: "NAO_COMPARECEU";
};
export type StatusJogo = (typeof StatusJogo)[keyof typeof StatusJogo];
export declare const PapelParticipante: {
    readonly CRIADOR: "CRIADOR";
    readonly JOGADOR: "JOGADOR";
};
export type PapelParticipante = (typeof PapelParticipante)[keyof typeof PapelParticipante];
export declare const StatusParticipante: {
    readonly CONFIRMADO: "CONFIRMADO";
    readonly SAIU: "SAIU";
    readonly REMOVIDO: "REMOVIDO";
};
export type StatusParticipante = (typeof StatusParticipante)[keyof typeof StatusParticipante];
export declare const StatusAula: {
    readonly CONFIRMADA: "CONFIRMADA";
    readonly CANCELADA: "CANCELADA";
    readonly CONCLUIDA: "CONCLUIDA";
};
export type StatusAula = (typeof StatusAula)[keyof typeof StatusAula];
export declare const StatusRecorrencia: {
    readonly ATIVA: "ATIVA";
    readonly CANCELADA: "CANCELADA";
    readonly FINALIZADA: "FINALIZADA";
};
export type StatusRecorrencia = (typeof StatusRecorrencia)[keyof typeof StatusRecorrencia];
export declare const PeriodoLimiteJogos: {
    readonly DIA: "DIA";
    readonly SEMANA: "SEMANA";
    readonly MES: "MES";
};
export type PeriodoLimiteJogos = (typeof PeriodoLimiteJogos)[keyof typeof PeriodoLimiteJogos];
export declare const AuthTokenTipo: {
    readonly ATIVACAO: "ATIVACAO";
    readonly RESET_SENHA: "RESET_SENHA";
};
export type AuthTokenTipo = (typeof AuthTokenTipo)[keyof typeof AuthTokenTipo];
export declare const StatusAmizade: {
    readonly PENDENTE: "PENDENTE";
    readonly ACEITA: "ACEITA";
    readonly RECUSADA: "RECUSADA";
    readonly BLOQUEADA: "BLOQUEADA";
};
export type StatusAmizade = (typeof StatusAmizade)[keyof typeof StatusAmizade];
export declare const StatusConviteJogo: {
    readonly PENDENTE: "PENDENTE";
    readonly ACEITO: "ACEITO";
    readonly RECUSADO: "RECUSADO";
    readonly CANCELADO: "CANCELADO";
};
export type StatusConviteJogo = (typeof StatusConviteJogo)[keyof typeof StatusConviteJogo];
export declare const StatusAssinatura: {
    readonly TESTE: "TESTE";
    readonly ATIVA: "ATIVA";
    readonly ATRASADA: "ATRASADA";
    readonly CANCELADA: "CANCELADA";
};
export type StatusAssinatura = (typeof StatusAssinatura)[keyof typeof StatusAssinatura];
export declare const TipoBloqueio: {
    readonly MANUTENCAO: "MANUTENCAO";
    readonly EVENTO: "EVENTO";
    readonly FERIADO: "FERIADO";
    readonly PARTICULAR: "PARTICULAR";
    readonly OUTRO: "OUTRO";
};
export type TipoBloqueio = (typeof TipoBloqueio)[keyof typeof TipoBloqueio];
//# sourceMappingURL=enums.d.ts.map