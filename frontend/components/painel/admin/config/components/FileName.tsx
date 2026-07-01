import { ImagePlus } from "lucide-react";

export function FileName({ name }: { name: string }) {
  return (
    <span className="mt-2 flex max-w-full items-center text-xs font-semibold text-zinc-500">
      <ImagePlus className="mr-1.5 h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{name}</span>
    </span>
  );
}
