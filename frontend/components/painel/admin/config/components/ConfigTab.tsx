"use client";

import type { ReactNode } from "react";

export function ConfigTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold transition",
        active
          ? "bg-zinc-950 text-white"
          : "bg-white text-zinc-600 hover:bg-zinc-100",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
