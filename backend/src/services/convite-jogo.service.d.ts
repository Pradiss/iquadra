import { ConvidarJogadorData } from "../schemas/convite-jogo.schema";
export declare function convidarJogadorParaJogo(usuarioId: string, jogoId: string, data: ConvidarJogadorData): Promise<{
    jogo: {
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
    };
    convidado: {
        nome: string;
        email: string;
        foto_perfil: string | null;
        id: string;
    };
    enviadoPor: {
        nome: string;
        email: string;
        foto_perfil: string | null;
        id: string;
    };
} & {
    id: string;
    status: import("../generated/prisma/enums").StatusConviteJogo;
    criado_em: Date;
    atualizado_em: Date;
    jogo_id: string;
    convidado_usuario_id: string;
    enviado_por_id: string;
}>;
export declare function listarConvitesJogos(usuarioId: string): Promise<({
    jogo: {
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
    };
    enviadoPor: {
        nome: string;
        email: string;
        foto_perfil: string | null;
        id: string;
    };
} & {
    id: string;
    status: import("../generated/prisma/enums").StatusConviteJogo;
    criado_em: Date;
    atualizado_em: Date;
    jogo_id: string;
    convidado_usuario_id: string;
    enviado_por_id: string;
})[]>;
export declare function aceitarConviteJogo(usuarioId: string, conviteId: string): Promise<{
    id: string;
    status: import("../generated/prisma/enums").StatusConviteJogo;
    criado_em: Date;
    atualizado_em: Date;
    jogo_id: string;
    convidado_usuario_id: string;
    enviado_por_id: string;
}>;
export declare function recusarConviteJogo(usuarioId: string, conviteId: string): Promise<{
    id: string;
    status: import("../generated/prisma/enums").StatusConviteJogo;
    criado_em: Date;
    atualizado_em: Date;
    jogo_id: string;
    convidado_usuario_id: string;
    enviado_por_id: string;
}>;
//# sourceMappingURL=convite-jogo.service.d.ts.map