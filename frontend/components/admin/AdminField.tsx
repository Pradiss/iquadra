import type { ReactNode } from "react";

export function AdminField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-gray-700">
        {label}
      </span>

      {children}
    </label>
  );
}