export declare function getDashboardAcademia(usuarioId: string, academiaId: string): Promise<{
    total_quadras: number;
    jogos_hoje: number;
    aulas_hoje: number;
    bloqueios_ativos: number;
    professores: number;
    clientes: number;
}>;
export declare function getAgendaAcademia(usuarioId: string, academiaId: string, data: string): Promise<{
    data: string;
    total: number;
    eventos: ({
        tipo: string;
        id: string;
        quadra: string;
        inicio_em: Date;
        fim_em: Date;
        status: import("../generated/prisma/enums").StatusJogo;
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
    } | {
        tipo: string;
        id: string;
        quadra: string;
        inicio_em: Date;
        fim_em: Date;
        status: import("../generated/prisma/enums").StatusAula;
        professor: {
            nome: string;
            foto_perfil: string | null;
            id: string;
        } | null;
        cliente: {
            nome: string;
            foto_perfil: string | null;
            id: string;
        } | null;
    } | {
        tipo: string;
        id: string;
        quadra: string;
        inicio_em: Date;
        fim_em: Date;
        tipo_bloqueio: import("../generated/prisma/enums").TipoBloqueio;
        motivo: string;
    })[];
}>;
//# sourceMappingURL=dashboard.service.d.ts.map