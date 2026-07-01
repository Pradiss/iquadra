"use client";

import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { maskCep, maskPhone } from "@/lib/masks";

import { useConfigAcademia } from "../hooks/useConfigAcademia";
import { maskCnpj, slugify } from "../lib/formatters";
import { AcademiaLogoField } from "./AcademiaLogoField";
import { Campo } from "./Campo";
import { DuracoesReservaField } from "./DuracoesReservaField";
import { Feedback } from "./Feedback";

export function ConfigAcademia({
  academiaId,
  isDono,
}: {
  academiaId: string;
  isDono: boolean;
}) {
  const {
    form,
    logoFile,
    loading,
    saving,
    erro,
    sucesso,
    logoSegura,
    updateField,
    toggleDuracao,
    handleLogoChange,
    salvarAcademia,
  } = useConfigAcademia(academiaId);

  if (!isDono) {
    return (
      <p className="rounded-2xl bg-yellow-50 p-4 text-sm font-semibold text-yellow-800">
        Apenas o dono da academia pode editar estes dados.
      </p>
    );
  }

  return (
    <section className="rounded-[28px] bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-xl font-black text-zinc-950">Academia</h2>

      <Feedback erro={erro} sucesso={sucesso} />

      {loading ? (
        <p className="mt-5 rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-500">
          Carregando academia...
        </p>
      ) : (
        <>
          <AcademiaLogoField
            nome={form.nome}
            logoUrl={logoSegura}
            logoFile={logoFile}
            onLogoChange={handleLogoChange}
          />

          <div className="mt-5 grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo label="Nome da academia">
                <Input
                  value={form.nome}
                  onChange={(event) => {
                    updateField("nome", event.target.value);
                    updateField("slug", slugify(event.target.value));
                  }}
                  className="h-[50px] rounded-xl bg-zinc-50"
                />
              </Campo>

              <Campo label="Slug">
                <Input
                  value={form.slug}
                  onChange={(event) =>
                    updateField("slug", slugify(event.target.value))
                  }
                  className="h-[50px] rounded-xl bg-zinc-50"
                />
              </Campo>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Campo label="CNPJ">
                <Input
                  value={maskCnpj(form.cnpj)}
                  onChange={(event) => updateField("cnpj", event.target.value)}
                  className="h-[50px] rounded-xl bg-zinc-50"
                />
              </Campo>

              <Campo label="Telefone">
                <Input
                  value={maskPhone(form.telefone)}
                  onChange={(event) =>
                    updateField("telefone", event.target.value)
                  }
                  className="h-[50px] rounded-xl bg-zinc-50"
                />
              </Campo>
            </div>

            <Campo label="E-mail">
              <Input
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                className="h-[50px] rounded-xl bg-zinc-50"
              />
            </Campo>

            <Campo label="Endereço">
              <Input
                value={form.endereco}
                onChange={(event) => updateField("endereco", event.target.value)}
                className="h-[50px] rounded-xl bg-zinc-50"
              />
            </Campo>

            <div className="grid gap-4 sm:grid-cols-[1fr_88px_140px]">
              <Campo label="Cidade">
                <Input
                  value={form.cidade}
                  onChange={(event) => updateField("cidade", event.target.value)}
                  className="h-[50px] rounded-xl bg-zinc-50"
                />
              </Campo>

              <Campo label="UF">
                <Input
                  value={form.estado}
                  maxLength={2}
                  onChange={(event) =>
                    updateField("estado", event.target.value.toUpperCase())
                  }
                  className="h-[50px] rounded-xl bg-zinc-50"
                />
              </Campo>

              <Campo label="CEP">
                <Input
                  value={maskCep(form.cep)}
                  onChange={(event) => updateField("cep", event.target.value)}
                  className="h-[50px] rounded-xl bg-zinc-50"
                />
              </Campo>
            </div>

            <DuracoesReservaField
              value={form.duracoes_reserva_minutos}
              onToggle={toggleDuracao}
            />

            <Button
              type="button"
              disabled={saving}
              onClick={salvarAcademia}
              className="h-[50px] rounded-2xl bg-zinc-950 font-bold text-white hover:bg-black"
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Salvando..." : "Salvar academia"}
            </Button>
          </div>
        </>
      )}
    </section>
  );
}
