import { CreateQuadraData, UpdateQuadraData } from "../schemas/quadra.schema";
export declare function createQuadra(usuarioId: string, academiaId: string, data: CreateQuadraData): Promise<{
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
}>;
export declare function listQuadrasByAcademia(academiaId: string): Promise<{
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
}[]>;
export declare function getQuadraById(id: string): Promise<{
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
    horarios: {
        id: string;
        criado_em: Date;
        atualizado_em: Date;
        dia_semana: number;
        abre_as: string;
        fecha_as: string;
        duracao_slot_minutos: number;
        ativo: boolean;
        quadra_id: string;
    }[];
} & {
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
}>;
export declare function updateQuadra(usuarioId: string, quadraId: string, data: UpdateQuadraData): Promise<{
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
}>;
export declare function updateStatusQuadra(usuarioId: string, quadraId: string, ativa: boolean): Promise<{
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
}>;
//# sourceMappingURL=quadra.service.d.ts.map