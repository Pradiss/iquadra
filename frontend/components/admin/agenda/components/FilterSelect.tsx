"use client";

import type { ReactNode } from "react";

type FilterSelectProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
};

export function FilterSelect({
  label,
  value,
  onChange,
  children,
}: FilterSelectProps) {
  return (
    <label className="grid gap-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-sm">
      <span className="text-xs font-semibold text-zinc-500">{label}</span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-36 bg-transparent text-sm font-black text-zinc-950 outline-none"
      >
        {children}
      </select>
    </label>
  );
}