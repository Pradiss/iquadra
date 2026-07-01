"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  addDays,
  formatMonth,
  formatWeekday,
  getWeekDays,
  parseDateOnly,
} from "@/app/painel/admin/agenda/utils";

type WeekSelectorProps = {
  value: string;
  onChange: (date: string) => void;
};

export function WeekSelector({ value, onChange }: WeekSelectorProps) {
  const days = getWeekDays(value);

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 text-sm font-black text-zinc-950">
        <span>{formatMonth(value)}</span>

        <button
          type="button"
          onClick={() => onChange(addDays(value, -7))}
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-zinc-100"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      <div className="grid min-w-0 flex-1 grid-cols-7 gap-2">
        {days.map((day) => {
          const selected = day === value;
          const parsed = parseDateOnly(day);

          return (
            <button
              key={day}
              type="button"
              onClick={() => onChange(day)}
              className={[
                "grid h-12 place-items-center rounded-xl text-xs font-black transition",
                selected
                  ? "bg-white text-zinc-950 shadow-sm"
                  : "text-zinc-500 hover:bg-white/70",
              ].join(" ")}
            >
              <span>{formatWeekday(day)}</span>
              <span>{String(parsed.getDate()).padStart(2, "0")}</span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => onChange(addDays(value, 7))}
        className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-zinc-100"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
