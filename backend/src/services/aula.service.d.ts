import { CreateAulaData } from "../schemas/aula.schema";
export declare function createAula(usuarioId: string, data: CreateAulaData): Promise<{
    id: string;
    status: import("../generated/prisma/enums").StatusAula;
    criado_em: Date;
    atualizado_em: Date;
    academia_id: string;
    quadra_id: string;
    inicio_em: Date;
    fim_em: Date;
    observacoes: string | null;
    cliente_id: string | null;
    professor_id: string | null;
    recorrente: boolean;
    recorrencia_id: string | null;
}>;
export declare function listAulas(params: {
    academia_id?: string;
    quadra_id?: string;
    professor_id?: string;
    cliente_id?: string;
    data?: string;
}): Promise<({
    academia: {
        nome: string;
        email: string | null;
        telefone: string | null;
        cidade: string | null;
        cep: string | null;
        slug: string;
        cnpj: string | null;
        endereco: string | null;
        estado: string | null;
        id: string;
        status: import("../generated/prisma/enums").StatusUsuario;
        criado_em: Date;
        atualizado_em: Date;
        limite_jogos_padrao: number;
        periodo_limite_jogos: import("../generated/prisma/enums").PeriodoLimiteJogos;
    };
    quadra: {
        nome: string;
        id: string;
        criado_em: Date;
        atualizado_em: Date;
        academia_id: string;
        descricao: string | null;
        tipo_piso: import("../generated/prisma/enums").TipoPiso;
        coberta: boolean;
        ordem_exibicao: number;
        ativa: boolean;
    };
    cliente: {
        nome: string;
        email: string;
        foto_perfil: string | null;
        id: string;
    } | null;
    professor: {
        nome: string;
        email: string;
        foto_perfil: string | null;
        id: string;
    } | null;
} & {
    id: string;
    status: import("../generated/prisma/enums").StatusAula;
    criado_em: Date;
    atualizado_em: Date;
    academia_id: string;
    quadra_id: string;
    inicio_em: Date;
    fim_em: Date;
    observacoes: string | null;
    cliente_id: string | null;
    professor_id: string | null;
    recorrente: boolean;
    recorrencia_id: string | null;
})[]>;
export declare function getAulaById(id: string): Promise<{
    academia: {
        nome: string;
        email: string | null;
        telefone: string | null;
        cidade: string | null;
        cep: string | null;
        slug: string;
        cnpj: string | null;
        endereco: string | null;
        estado: string | null;
        id: string;
        status: import("../generated/prisma/enums").StatusUsuario;
        criado_em: Date;
        atualizado_em: Date;
        limite_jogos_padrao: number;
        periodo_limite_jogos: import("../generated/prisma/enums").PeriodoLimiteJogos;
    };
    quadra: {
        nome: string;
        id: string;
        criado_em: Date;
        atualizado_em: Date;
        academia_id: string;
        descricao: string | null;
        tipo_piso: import("../generated/prisma/enums").TipoPiso;
        coberta: boolean;
        ordem_exibicao: number;
        ativa: boolean;
    };
    cliente: {
        nome: string;
        email: string;
        foto_perfil: string | null;
        id: string;
    } | null;
    professor: {
        nome: string;
        email: string;
        foto_perfil: string | null;
        id: string;
    } | null;
} & {
    id: string;
    status: import("../generated/prisma/enums").StatusAula;
    criado_em: Date;
    atualizado_em: Date;
    academia_id: string;
    quadra_id: string;
    inicio_em: Date;
    fim_em: Date;
    observacoes: string | null;
    cliente_id: string | null;
    professor_id: string | null;
    recorrente: boolean;
    recorrencia_id: string | null;
}>;
export declare function cancelarAula(usuarioId: string, aulaId: string): Promise<{
    academia: {
        nome: string;
        email: string | null;
        telefone: string | null;
        cidade: string | null;
        cep: string | null;
        slug: string;
        cnpj: string | null;
        endereco: string | null;
        estado: string | null;
        id: string;
        status: import("../generated/prisma/enums").StatusUsuario;
        criado_em: Date;
        atualizado_em: Date;
        limite_jogos_padrao: number;
        periodo_limite_jogos: import("../generated/prisma/enums").PeriodoLimiteJogos;
    };
    quadra: {
        nome: string;
        id: string;
        criado_em: Date;
        atualizado_em: Date;
        academia_id: string;
        descricao: string | null;
        tipo_piso: import("../generated/prisma/enums").TipoPiso;
        coberta: boolean;
        ordem_exibicao: number;
        ativa: boolean;
    };
    cliente: {
        nome: string;
        email: string;
        foto_perfil: string | null;
        id: string;
    } | null;
    professor: {
        nome: string;
        email: string;
        foto_perfil: string | null;
        id: string;
    } | null;
} & {
    id: string;
    status: import("../generated/prisma/enums").StatusAula;
    criado_em: Date;
    atualizado_em: Date;
    academia_id: string;
    quadra_id: string;
    inicio_em: Date;
    fim_em: Date;
    observacoes: string | null;
    cliente_id: string | null;
    professor_id: string | null;
    recorrente: boolean;
    recorrencia_id: string | null;
}>;
//# sourceMappingURL=aula.service.d.ts.map