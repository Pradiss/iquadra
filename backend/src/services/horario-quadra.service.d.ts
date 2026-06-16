import { CreateHorarioQuadraData, UpdateHorarioQuadraData } from "../schemas/horario-quadra.schema";
export declare function createHorarioQuadra(usuarioId: string, quadraId: string, data: CreateHorarioQuadraData): Promise<{
    id: string;
    criado_em: Date;
    atualizado_em: Date;
    dia_semana: number;
    abre_as: string;
    fecha_as: string;
    duracao_slot_minutos: number;
    ativo: boolean;
    quadra_id: string;
}>;
export declare function listHorariosQuadra(quadraId: string): Promise<{
    id: string;
    criado_em: Date;
    atualizado_em: Date;
    dia_semana: number;
    abre_as: string;
    fecha_as: string;
    duracao_slot_minutos: number;
    ativo: boolean;
    quadra_id: string;
}[]>;
export declare function updateHorarioQuadra(usuarioId: string, horarioId: string, data: UpdateHorarioQuadraData): Promise<{
    id: string;
    criado_em: Date;
    atualizado_em: Date;
    dia_semana: number;
    abre_as: string;
    fecha_as: string;
    duracao_slot_minutos: number;
    ativo: boolean;
    quadra_id: string;
}>;
export declare function deleteHorarioQuadra(usuarioId: string, horarioId: string): Promise<boolean>;
//# sourceMappingURL=horario-quadra.service.d.ts.map