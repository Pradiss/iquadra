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
  try {
    await tx.$executeRaw`SET LOCAL lock_timeout = '3000ms'`;
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${key}))`;
  } catch (error) {
    if (
      error instanceof Error &&
      /lock timeout|canceling statement/i.test(error.message)
    ) {
      throw new Error(
        "Nao foi possivel confirmar a operacao agora. Tente novamente em alguns segundos."
      );
    }

    throw error;
  }
}
