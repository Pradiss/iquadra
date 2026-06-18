import type { ReactNode } from "react";

export function AdminPage({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="max-w-6xl">
      <section className="mb-6">
        <p className="text-sm font-semibold text-green-700">Admin</p>

        <h1 className="text-3xl font-bold tracking-[-0.03em] text-zinc-950">
          {title}
        </h1>

        <p className="mt-3 text-sm text-zinc-400">{description}</p>
      </section>

      {children}
    </section>
  );
}