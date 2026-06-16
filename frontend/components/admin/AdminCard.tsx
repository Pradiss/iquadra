import type { ReactNode } from "react";

export function AdminCard({
  title,
  description,
  children,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      {(title || description) && (
        <div className="mb-5">
          {title && (
            <h2 className="text-lg font-bold text-zinc-950">{title}</h2>
          )}

          {description && (
            <p className="mt-1 text-sm leading-6 text-zinc-500">
              {description}
            </p>
          )}
        </div>
      )}

      {children}
    </section>
  );
}