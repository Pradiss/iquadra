import { CreateJogoData } from "../schemas/jogo.schema";
export declare function createJogo(usuarioId: string, data: CreateJogoData): Promise<{
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
    participantes: ({
        usuario: {
            nome: string;
            email: string;
            foto_perfil: string | null;
            id: string;
        };
    } & {
        id: string;
        status: import("../generated/prisma/enums").StatusParticipante;
        criado_em: Date;
        atualizado_em: Date;
        usuario_id: string;
        jogo_id: string;
        papel: import("../generated/prisma/enums").PapelParticipante;
    })[];
} & {
    id: string;
    status: import("../generated/prisma/enums").StatusJogo;
    criado_em: Date;
    atualizado_em: Date;
    academia_id: string;
    quadra_id: string;
    inicio_em: Date;
    fim_em: Date;
    criado_por_usuario_id: string;
    responsavel_usuario_id: string;
    tipo_jogo: import("../generated/prisma/enums").TipoJogo;
    maximo_participantes: number;
    observacoes: string | null;
    observacoes_internas: string | null;
}>;
export declare function listJogos(params: {
    academia_id?: string;
    data?: string;
    status?: "ABERTO" | "COMPLETO" | "CANCELADO" | "CONCLUIDO";
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
    participantes: ({
        usuario: {
            nome: string;
            foto_perfil: string | null;
            id: string;
        };
    } & {
        id: string;
        status: import("../generated/prisma/enums").StatusParticipante;
        criado_em: Date;
        atualizado_em: Date;
        usuario_id: string;
        jogo_id: string;
        papel: import("../generated/prisma/enums").PapelParticipante;
    })[];
} & {
    id: string;
    status: import("../generated/prisma/enums").StatusJogo;
    criado_em: Date;
    atualizado_em: Date;
    academia_id: string;
    quadra_id: string;
    inicio_em: Date;
    fim_em: Date;
    criado_por_usuario_id: string;
    responsavel_usuario_id: string;
    tipo_jogo: import("../generated/prisma/enums").TipoJogo;
    maximo_participantes: number;
    observacoes: string | null;
    observacoes_internas: string | null;
})[]>;
export declare function getJogoById(id: string): Promise<{
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
    participantes: ({
        usuario: {
            nome: string;
            email: string;
            foto_perfil: string | null;
            id: string;
        };
    } & {
        id: string;
        status: import("../generated/prisma/enums").StatusParticipante;
        criado_em: Date;
        atualizado_em: Date;
        usuario_id: string;
        jogo_id: string;
        papel: import("../generated/prisma/enums").PapelParticipante;
    })[];
} & {
    id: string;
    status: import("../generated/prisma/enums").StatusJogo;
    criado_em: Date;
    atualizado_em: Date;
    academia_id: string;
    quadra_id: string;
    inicio_em: Date;
    fim_em: Date;
    criado_por_usuario_id: string;
    responsavel_usuario_id: string;
    tipo_jogo: import("../generated/prisma/enums").TipoJogo;
    maximo_participantes: number;
    observacoes: string | null;
    observacoes_internas: string | null;
}>;
export declare function participarJogo(usuarioId: string, jogoId: string): Promise<{
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
    participantes: ({
        usuario: {
            nome: string;
            email: string;
            foto_perfil: string | null;
            id: string;
        };
    } & {
        id: string;
        status: import("../generated/prisma/enums").StatusParticipante;
        criado_em: Date;
        atualizado_em: Date;
        usuario_id: string;
        jogo_id: string;
        papel: import("../generated/prisma/enums").PapelParticipante;
    })[];
} & {
    id: string;
    status: import("../generated/prisma/enums").StatusJogo;
    criado_em: Date;
    atualizado_em: Date;
    academia_id: string;
    quadra_id: string;
    inicio_em: Date;
    fim_em: Date;
    criado_por_usuario_id: string;
    responsavel_usuario_id: string;
    tipo_jogo: import("../generated/prisma/enums").TipoJogo;
    maximo_participantes: number;
    observacoes: string | null;
    observacoes_internas: string | null;
}>;
export declare function sairJogo(usuarioId: string, jogoId: string): Promise<{
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
    participantes: ({
        usuario: {
            nome: string;
            email: string;
            foto_perfil: string | null;
            id: string;
        };
    } & {
        id: string;
        status: import("../generated/prisma/enums").StatusParticipante;
        criado_em: Date;
        atualizado_em: Date;
        usuario_id: string;
        jogo_id: string;
        papel: import("../generated/prisma/enums").PapelParticipante;
    })[];
} & {
    id: string;
    status: import("../generated/prisma/enums").StatusJogo;
    criado_em: Date;
    atualizado_em: Date;
    academia_id: string;
    quadra_id: string;
    inicio_em: Date;
    fim_em: Date;
    criado_por_usuario_id: string;
    responsavel_usuario_id: string;
    tipo_jogo: import("../generated/prisma/enums").TipoJogo;
    maximo_participantes: number;
    observacoes: string | null;
    observacoes_internas: string | null;
}>;
export declare function cancelarJogo(usuarioId: string, jogoId: string): Promise<{
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
    participantes: ({
        usuario: {
            nome: string;
            email: string;
            foto_perfil: string | null;
            id: string;
        };
    } & {
        id: string;
        status: import("../generated/prisma/enums").StatusParticipante;
        criado_em: Date;
        atualizado_em: Date;
        usuario_id: string;
        jogo_id: string;
        papel: import("../generated/prisma/enums").PapelParticipante;
    })[];
} & {
    id: string;
    status: import("../generated/prisma/enums").StatusJogo;
    criado_em: Date;
    atualizado_em: Date;
    academia_id: string;
    quadra_id: string;
    inicio_em: Date;
    fim_em: Date;
    criado_por_usuario_id: string;
    responsavel_usuario_id: string;
    tipo_jogo: import("../generated/prisma/enums").TipoJogo;
    maximo_participantes: number;
    observacoes: string | null;
    observacoes_internas: string | null;
}>;
//# sourceMappingURL=jogo.service.d.ts.map