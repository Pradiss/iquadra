"use client";

import { Building2, UserRound } from "lucide-react";
import { useState } from "react";

import { ConfigAcademia } from "./components/ConfigAcademia";
import { ConfigPerfil } from "./components/ConfigPerfil";
import { ConfigTab } from "./components/ConfigTab";
import { useAdminConfigContext } from "./hooks/useAdminConfigContext";
import type { AbaConfig } from "./types";

export function ConfigAdmin() {
  const [aba, setAba] = useState<AbaConfig>("perfil");
  const context = useAdminConfigContext();

  if (!context) {
    return (
      <p className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-600">
        Nao foi possivel carregar a academia vinculada.
      </p>
    );
  }

  return (
    <div>
      <div className="mb-5 flex gap-2 overflow-x-auto">
        <ConfigTab active={aba === "perfil"} onClick={() => setAba("perfil")}>
          <UserRound className="h-4 w-4" />
          Editar perfil
        </ConfigTab>

        <ConfigTab
          active={aba === "academia"}
          onClick={() => setAba("academia")}
        >
          <Building2 className="h-4 w-4" />
          Editar academia
        </ConfigTab>
      </div>

      {aba === "perfil" ? (
        <ConfigPerfil usuario={context.usuario} />
      ) : (
        <ConfigAcademia
          academiaId={context.academiaId}
          isDono={context.isDono}
        />
      )}
    </div>
  );
}
