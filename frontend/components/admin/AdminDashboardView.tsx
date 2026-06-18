"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AdminCard } from "@/components/admin/AdminCard";
import { Button } from "@/components/ui/button";
import { listarQuadras, type QuadraAdmin } from "@/services/admin.service";
import { getUsuario, type AcademiaUsuarioLogado } from "@/lib/auth-storage";
import { getAdminAcademias } from "@/lib/user-role";

type UsuarioAdmin = {
  academias?: AcademiaUsuarioLogado[];
};

function getAcademiaId() {
  const usuario = getUsuario() as UsuarioAdmin | null;
  const vinculo = getAdminAcademias(usuario)[0];

  return vinculo?.academia_id ?? vinculo?.academia?.id ?? "";
}

export function AdminDashboardView() {
  const router = useRouter();

  const [quadras, setQuadras] = useState<QuadraAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const totalQuadras = quadras.length;
  const quadrasAtivas = quadras.filter((quadra) => quadra.ativa).length;

  useEffect(() => {
    async function carregar() {
      const academiaId = getAcademiaId();

      if (!academiaId) {
        setErro("Nenhuma academia vinculada ao usuário.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await listarQuadras(academiaId);
        setQuadras(Array.isArray(data) ? data : []);
      } catch {
        setErro("Não foi possível carregar os dados do admin.");
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, []);

  return (
    <div className="grid gap-4">
      {erro && (
        <p className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-600">
          {erro}
        </p>
      )}

      <section className="grid gap-4 lg:grid-cols-3">
        <AdminCard
          title="Quadras"
          description="Cadastre e gerencie as quadras da academia."
        >
          <Button
            type="button"
            onClick={() => router.push("/painel/admin/quadras")}
            className="h-11 rounded-xl bg-gray-900 text-white"
          >
            Gerenciar quadras
          </Button>
        </AdminCard>

        <AdminCard
          title="Horários"
          description="Crie horários fixos em slots de 90 minutos."
        >
          <Button
            type="button"
            onClick={() => router.push("/painel/admin/horarios")}
            className="h-11 rounded-xl bg-gray-900 text-white"
          >
            Gerenciar horários
          </Button>
        </AdminCard>

        <AdminCard
          title="Agenda"
          description="Veja horários disponíveis e agende para clientes."
        >
          <Button
            type="button"
            onClick={() => router.push("/painel/admin/agenda")}
            className="h-11 rounded-xl bg-gray-900 text-white"
          >
            Ver agenda
          </Button>
        </AdminCard>
      </section>
      <section className="grid gap-3 sm:grid-cols-3">
        <AdminCard>
          <p className="text-sm font-semibold text-zinc-500">
            Total de quadras
          </p>
          <strong className="mt-3 block text-3xl font-bold text-zinc-950">
            {loading ? "..." : totalQuadras}
          </strong>
        </AdminCard>

        <AdminCard>
          <p className="text-sm font-semibold text-zinc-500">Quadras ativas</p>
          <strong className="mt-3 block text-3xl font-bold text-zinc-950">
            {loading ? "..." : quadrasAtivas}
          </strong>
        </AdminCard>

        <AdminCard>
          <p className="text-sm font-semibold text-zinc-500">Slot padrão</p>
          <strong className="mt-3 block text-3xl font-bold text-zinc-950">
            90min
          </strong>
        </AdminCard>
      </section>
    </div>
  );
}
