"use client";

import { Building2 } from "lucide-react";
import type { ChangeEvent } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ACADEMIA_LOGO_ACCEPT } from "@/services/academia.service";

import { Campo } from "./Campo";
import { FileName } from "./FileName";

export function AcademiaLogoField({
  nome,
  logoUrl,
  logoFile,
  onLogoChange,
}: {
  nome: string;
  logoUrl: string;
  logoFile: File | null;
  onLogoChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="mt-5 flex flex-col items-center rounded-[24px] bg-zinc-50 p-5">
      <Avatar className="h-28 w-28 overflow-hidden rounded-2xl border-4 border-white bg-green-100 shadow-sm">
        {logoUrl && (
          <AvatarImage
            src={logoUrl}
            alt={nome}
            className="h-full w-full rounded-2xl object-cover"
          />
        )}

        <AvatarFallback className="h-full w-full rounded-2xl bg-green-100 text-green-800">
          <Building2 className="h-9 w-9" />
        </AvatarFallback>
      </Avatar>

      <div className="mt-5 w-full">
        <Campo label="Logo da academia">
          <Input
            type="file"
            accept={ACADEMIA_LOGO_ACCEPT}
            onChange={onLogoChange}
            className="h-[50px] rounded-xl bg-white pt-3"
          />
        </Campo>

        {logoFile && <FileName name={logoFile.name} />}
      </div>
    </div>
  );
}
