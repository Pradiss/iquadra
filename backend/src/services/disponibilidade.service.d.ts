export declare function getDisponibilidadeQuadra(quadraId: string, data: string): Promise<{
    quadra: {
        id: string;
        nome: string;
        academia?: never;
    };
    data: string;
    aberta: boolean;
    motivo: string;
    slots: never[];
    abre_as?: never;
    fecha_as?: never;
    duracao_slot_minutos?: never;
} | {
    quadra: {
        id: string;
        nome: string;
        academia: string;
    };
    data: string;
    aberta: boolean;
    abre_as: string;
    fecha_as: string;
    duracao_slot_minutos: number;
    slots: {
        inicio: string;
        fim: string;
        disponivel: boolean;
        motivo: string | null;
    }[];
    motivo?: never;
}>;
//# sourceMappingURL=disponibilidade.service.d.ts.map