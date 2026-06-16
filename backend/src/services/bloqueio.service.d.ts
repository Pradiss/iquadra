import { CreateBloqueioData } from "../schemas/bloqueio.schema";
export declare function createBloqueio(usuarioId: string, quadraId: string, data: CreateBloqueioData): Promise<{
    id: string;
    criado_em: Date;
    atualizado_em: Date;
    quadra_id: string;
    motivo: string;
    inicio_em: Date;
    fim_em: Date;
    tipo_bloqueio: import("../generated/prisma/enums").TipoBloqueio;
    criado_por_usuario_id: string;
}>;
export declare function listBloqueiosByQuadra(quadraId: string): Promise<({
    criado_por: {
        nome: string;
        email: string;
        id: string;
    };
} & {
    id: string;
    criado_em: Date;
    atualizado_em: Date;
    quadra_id: string;
    motivo: string;
    inicio_em: Date;
    fim_em: Date;
    tipo_bloqueio: import("../generated/prisma/enums").TipoBloqueio;
    criado_por_usuario_id: string;
})[]>;
export declare function deleteBloqueio(usuarioId: string, bloqueioId: string): Promise<boolean>;
//# sourceMappingURL=bloqueio.service.d.ts.map