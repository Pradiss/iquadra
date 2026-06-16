import { CreateAmizadeData } from "../schemas/amizade.schema";
export declare function solicitarAmizade(usuarioId: string, data: CreateAmizadeData): Promise<{
    usuario: {
        nome: string;
        email: string;
        foto_perfil: string | null;
        id: string;
    };
    amigo: {
        nome: string;
        email: string;
        foto_perfil: string | null;
        id: string;
    };
} & {
    id: string;
    status: import("../generated/prisma/enums").StatusAmizade;
    criado_em: Date;
    atualizado_em: Date;
    usuario_id: string;
    amigo_id: string;
}>;
export declare function listarAmizades(usuarioId: string): Promise<({
    usuario: {
        nome: string;
        email: string;
        foto_perfil: string | null;
        id: string;
    };
    amigo: {
        nome: string;
        email: string;
        foto_perfil: string | null;
        id: string;
    };
} & {
    id: string;
    status: import("../generated/prisma/enums").StatusAmizade;
    criado_em: Date;
    atualizado_em: Date;
    usuario_id: string;
    amigo_id: string;
})[]>;
export declare function aceitarAmizade(usuarioId: string, amizadeId: string): Promise<{
    usuario: {
        nome: string;
        email: string;
        foto_perfil: string | null;
        id: string;
    };
    amigo: {
        nome: string;
        email: string;
        foto_perfil: string | null;
        id: string;
    };
} & {
    id: string;
    status: import("../generated/prisma/enums").StatusAmizade;
    criado_em: Date;
    atualizado_em: Date;
    usuario_id: string;
    amigo_id: string;
}>;
export declare function recusarAmizade(usuarioId: string, amizadeId: string): Promise<{
    id: string;
    status: import("../generated/prisma/enums").StatusAmizade;
    criado_em: Date;
    atualizado_em: Date;
    usuario_id: string;
    amigo_id: string;
}>;
export declare function removerAmizade(usuarioId: string, amizadeId: string): Promise<boolean>;
//# sourceMappingURL=amizade.service.d.ts.map