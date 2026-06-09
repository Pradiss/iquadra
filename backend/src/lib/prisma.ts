import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { getRequiredEnv } from "./env";

const adapter = new PrismaPg({
  connectionString: getRequiredEnv("DATABASE_URL"),
});

export const prisma = new PrismaClient({
  adapter,
});
