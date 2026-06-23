import { prisma } from "../lib/prisma";
import {
  CACHE_TTL,
  getOrSetCache,
  invalidateAcademiaCache,
} from "../lib/cache";
import { CreateAcademiaData } from "../schemas/academia.schema";

export async function createAcademia(data: CreateAcademiaData) {
  const academiaExistente = await prisma.academia.findUnique({
    where: {
      slug: data.slug,
    },
  });

  if (academiaExistente) {
    throw new Error("Já existe uma academia com este slug");
  }

  const academia = await prisma.academia.create({
    data,
  });

  invalidateAcademiaCache(academia.id);

  return academia;
}

export async function listAcademias() {
  return getOrSetCache("academias:list:ativas", CACHE_TTL.academias, () =>
    prisma.academia.findMany({
      where: {
        status: "ATIVO",
      },
      select: {
        id: true,
        nome: true,
        slug: true,
        cidade: true,
        estado: true,
        status: true,
      },
      orderBy: {
        nome: "asc",
      },
    })
  );
}

export async function getAcademiaById(id: string) {
  const academia = await getOrSetCache(
    `academia:${id}:public`,
    CACHE_TTL.academias,
    () =>
      prisma.academia.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          nome: true,
          slug: true,
          cidade: true,
          estado: true,
          status: true,
          criado_em: true,
        },
      })
  );

  if (!academia) {
    throw new Error("Academia não encontrada");
  }

  return academia;
}
