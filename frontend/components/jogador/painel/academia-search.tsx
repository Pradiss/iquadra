"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function AcademiaSearch({
  value,
  onChange,
}: Props) {
  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar academia..."
        className="h-12 rounded-2xl pl-10"
      />
    </div>
  );
}