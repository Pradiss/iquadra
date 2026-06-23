import { Prisma } from "../generated/prisma/client";

export type TransactionClient = Prisma.TransactionClient;

export async function lockAgendaSlot(
  tx: TransactionClient,
  quadraId: string,
  inicio: Date
) {
  const data = inicio.toISOString().slice(0, 10);
  await lockKey(tx, `agenda:${quadraId}:${data}`);
}

export async function lockJogo(tx: TransactionClient, jogoId: string) {
  await lockKey(tx, `jogo:${jogoId}`);
}

async function lockKey(tx: TransactionClient, key: string) {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${key}))`;
}
