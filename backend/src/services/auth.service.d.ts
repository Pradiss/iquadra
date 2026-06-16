import { LoginData, RegisterAcademiaData, RegisterClienteData, RegisterProfessorData } from "../schemas/auth.schema";
export declare function registerCliente(data: RegisterClienteData): Promise<{
    nome: string;
    email: string;
    telefone: string;
    foto_perfil: string | null;
    id: string;
    senha_hash: string;
    status: import("../generated/prisma/enums").StatusUsuario;
    criado_em: Date;
    atualizado_em: Date;
}>;
export declare function registerProfessor(data: RegisterProfessorData): Promise<{
    nome: string;
    email: string;
    telefone: string;
    foto_perfil: string | null;
    id: string;
    senha_hash: string;
    status: import("../generated/prisma/enums").StatusUsuario;
    criado_em: Date;
    atualizado_em: Date;
}>;
export declare function registerAcademia(data: RegisterAcademiaData): Promise<{
    usuario: {
        id: string;
        nome: string;
        email: string;
        telefone: string;
        foto_perfil: string | null;
        status: import("../generated/prisma/enums").StatusUsuario;
    };
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
}>;
export declare function loginUser(data: LoginData): Promise<{
    token: string;
    usuario: {
        id: string;
        nome: string;
        email: string;
        telefone: string;
        foto_perfil: string | null;
        status: "ATIVO";
        perfil_cliente: {
            categoria: import("../generated/prisma/enums").CategoriaUsuario;
            cidade: string;
            cep: string;
            id: string;
            criado_em: Date;
            atualizado_em: Date;
            usuario_id: string;
        } | null;
        perfil_professor: {
            cidade: string | null;
            bio: string | null;
            especialidades: string | null;
            id: string;
            criado_em: Date;
            atualizado_em: Date;
            usuario_id: string;
        } | null;
        academias: ({
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
        } & {
            id: string;
            status: import("../generated/prisma/enums").StatusUsuario;
            criado_em: Date;
            atualizado_em: Date;
            usuario_id: string;
            academia_id: string;
            perfil: import("../generated/prisma/enums").PerfilAcademiaUsuario;
            limite_jogos_personalizado: number | null;
        })[];
    };
}>;
//# sourceMappingURL=auth.service.d.ts.map