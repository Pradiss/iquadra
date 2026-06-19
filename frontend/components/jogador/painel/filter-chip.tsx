"use client";

import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Props = {
  label: string;
  active?: boolean;
  icon?: ReactNode;
  iconOnly?: boolean;
  children: ReactNode;
};

export function FilterChip({
  label,
  active = false,
  icon,
  iconOnly = false,
  children,
}: Props) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={iconOnly ? label : undefined}
          className={[
            "inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-[20px] border px-3 text-[13px] font-bold shadow-sm transition",
            iconOnly ? "w-12 px-0" : "",
            active
              ? "border-green-100 bg-green-50 text-green-800"
              : "border-zinc-200 bg-white text-zinc-950 hover:border-zinc-300",
          ].join(" ")}
        >
          {icon}
          {!iconOnly && <span>{label}</span>}
          {!iconOnly && <ChevronDown className="h-4 w-4" />}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={10}
        className="w-fit min-w-[150px] max-w-[calc(100vw-32px)] rounded-3xl border border-zinc-100 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.14)]"
      >
        <div className="w-fit max-w-[240px] overflow-hidden">{children}</div>
      </PopoverContent>
    </Popover>
  );
}
