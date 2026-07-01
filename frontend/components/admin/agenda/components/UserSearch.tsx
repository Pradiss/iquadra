"use client";

import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import type { UsuarioBusca } from "@/services/admin-agenda";

type UserSearchProps = {
  value: string;
  results: UsuarioBusca[];
  loading: boolean;
  onChange: (value: string) => void;
  onPick: (usuario: UsuarioBusca) => void;
  onClear: () => void;
  placeholder: string;
};

export function UserSearch({
  value,
  results,
  loading,
  onChange,
  onPick,
  onClear,
  placeholder,
}: UserSearchProps) {
  return (
    <div className="grid gap-2">
      <div className="relative">
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="h-10 pr-9"
        />

        {value ? (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <Search className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        )}
      </div>

      {value.trim().length >= 2 && (
        <div className="max-h-36 overflow-y-auto rounded-lg border bg-white p-1">
          {loading ? (
            <p className="px-2 py-2 text-sm text-zinc-500">Buscando...</p>
          ) : results.length === 0 ? (
            <p className="px-2 py-2 text-sm text-zinc-500">
              Nenhum usuário encontrado.
            </p>
          ) : (
            results.map((usuario) => (
              <button
                key={usuario.id}
                type="button"
                onClick={() => onPick(usuario)}
                className="block w-full rounded-md px-2 py-2 text-left text-sm font-semibold hover:bg-zinc-50"
              >
                {usuario.nome}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}