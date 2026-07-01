import type { ReactNode } from "react";

export function Campo({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-zinc-700">
        {label}
      </span>

      {children}
    </label>
  );
}
