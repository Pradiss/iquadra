import * as runtime from "@prisma/client/runtime/client";
import * as $Class from "./internal/class.js";
import * as Prisma from "./internal/prismaNamespace.js";
export * as $Enums from './enums.js';
export * from "./enums.js";
/**
 * ## Prisma Client
 *
 * Type-safe database client for TypeScript
 * @example
 * ```
 * const prisma = new PrismaClient({
 *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
 * })
 * // Fetch zero or more Usuarios
 * const usuarios = await prisma.usuario.findMany()
 * ```
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export declare const PrismaClient: $Class.PrismaClientConstructor;
export type PrismaClient<LogOpts extends Prisma.LogLevel = never, OmitOpts extends Prisma.PrismaClientOptions["omit"] = Prisma.PrismaClientOptions["omit"], ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = $Class.PrismaClient<LogOpts, OmitOpts, ExtArgs>;
export { Prisma };
/**
 * Model Usuario
 *
 */
export type Usuario = Prisma.UsuarioModel;
/**
 * Model PerfilCliente
 *
 */
export type PerfilCliente = Prisma.PerfilClienteModel;
/**
 * Model PerfilProfessor
 *
 */
export type PerfilProfessor = Prisma.PerfilProfessorModel;
/**
 * Model Academia
 *
 */
export type Academia = Prisma.AcademiaModel;
/**
 * Model AcademiaUsuario
 *
 */
export type AcademiaUsuario = Prisma.AcademiaUsuarioModel;
/**
 * Model AuthToken
 *
 */
export type AuthToken = Prisma.AuthTokenModel;
/**
 * Model Quadra
 *
 */
export type Quadra = Prisma.QuadraModel;
/**
 * Model HorarioQuadra
 *
 */
export type HorarioQuadra = Prisma.HorarioQuadraModel;
/**
 * Model HorarioEspecialQuadra
 *
 */
export type HorarioEspecialQuadra = Prisma.HorarioEspecialQuadraModel;
/**
 * Model BloqueioQuadra
 *
 */
export type BloqueioQuadra = Prisma.BloqueioQuadraModel;
/**
 * Model Jogo
 *
 */
export type Jogo = Prisma.JogoModel;
/**
 * Model ParticipanteJogo
 *
 */
export type ParticipanteJogo = Prisma.ParticipanteJogoModel;
/**
 * Model ConviteJogo
 *
 */
export type ConviteJogo = Prisma.ConviteJogoModel;
/**
 * Model Aula
 *
 */
export type Aula = Prisma.AulaModel;
/**
 * Model RecorrenciaAula
 *
 */
export type RecorrenciaAula = Prisma.RecorrenciaAulaModel;
/**
 * Model Amizade
 *
 */
export type Amizade = Prisma.AmizadeModel;
/**
 * Model AssinaturaAcademia
 *
 */
export type AssinaturaAcademia = Prisma.AssinaturaAcademiaModel;
/**
 * Model LogAuditoria
 *
 */
export type LogAuditoria = Prisma.LogAuditoriaModel;
//# sourceMappingURL=client.d.ts.map