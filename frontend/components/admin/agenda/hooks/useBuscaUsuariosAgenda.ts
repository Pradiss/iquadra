"use client";

import { useEffect, useState } from "react";

import {
  buscarUsuariosAdminAgenda,
  type UsuarioBusca,
} from "@/services/admin-agenda";

import type { BuscaUsuarioModo } from "@/app/painel/admin/agenda/types";

export function useBuscaUsuariosAgenda(dialogOpen: boolean) {
  const [buscaUsuario, setBuscaUsuario] = useState("");
  const [buscaModo, setBuscaModo] = useState<BuscaUsuarioModo>(null);
  const [usuariosBusca, setUsuariosBusca] = useState<UsuarioBusca[]>([]);
  const [buscandoUsuarios, setBuscandoUsuarios] = useState(false);

  useEffect(() => {
    let active = true;
    const termo = buscaUsuario.trim();

    const timeoutId = window.setTimeout(() => {
      if (!dialogOpen || !buscaModo || termo.length < 2) {
        setUsuariosBusca([]);
        setBuscandoUsuarios(false);
        return;
      }

      setBuscandoUsuarios(true);

      buscarUsuariosAdminAgenda(termo)
        .then((usuarios) => {
          if (active) setUsuariosBusca(usuarios);
        })
        .catch(() => {
          if (active) setUsuariosBusca([]);
        })
        .finally(() => {
          if (active) setBuscandoUsuarios(false);
        });
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [buscaModo, buscaUsuario, dialogOpen]);

  function handleSearch(modo: BuscaUsuarioModo, value: string) {
    setBuscaModo(modo);
    setBuscaUsuario(value);
  }

  function limparBusca() {
    setBuscaModo(null);
    setBuscaUsuario("");
    setUsuariosBusca([]);
  }

  return {
    buscaUsuario,
    buscaModo,
    usuariosBusca,
    buscandoUsuarios,
    handleSearch,
    limparBusca,
    setBuscaModo,
    setBuscaUsuario,
    setUsuariosBusca,
  };
}
