"use client";

import { useState } from "react";
import {
  addDays,
  format,
  isAfter,
  isBefore,
  startOfDay,
  startOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";

type Props = {
  dataSelecionada: string;
  onSelectData: (data: string) => void;
  maxDiasAgendamento?: number;
};

function formatDate(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function AgendaCalendar({
  dataSelecionada,
  onSelectData,
  maxDiasAgendamento,
}: Props) {
  const [mostrarCalendario, setMostrarCalendario] = useState(false);

  const hoje = startOfDay(new Date());
  const dataLimite =
    typeof maxDiasAgendamento === "number"
      ? startOfDay(addDays(hoje, maxDiasAgendamento))
      : null;
  const dataAtual = new Date(dataSelecionada + "T00:00:00");

  function podeSelecionar(data: Date) {
    const dataNormalizada = startOfDay(data);

    if (isBefore(dataNormalizada, hoje)) return false;
    if (dataLimite && isAfter(dataNormalizada, dataLimite)) return false;

    return true;
  }

  function semanaTemDataSelecionavel(inicioSemana: Date) {
    return Array.from({ length: 7 }, (_, index) =>
      addDays(inicioSemana, index)
    ).some(podeSelecionar);
  }

  function voltarSemana() {
    const novaData = addDays(dataAtual, -7);
    const novaSemana = startOfWeek(novaData, { weekStartsOn: 1 });

    if (!semanaTemDataSelecionavel(novaSemana)) return;

    onSelectData(formatDate(podeSelecionar(novaData) ? novaData : hoje));
  }

  function avancarSemana() {
    const novaData = addDays(dataAtual, 7);
    const novaSemana = startOfWeek(novaData, { weekStartsOn: 1 });

    if (!semanaTemDataSelecionavel(novaSemana)) return;

    const dataSelecionavel =
      dataLimite && isAfter(startOfDay(novaData), dataLimite)
        ? dataLimite
        : novaData;

    onSelectData(formatDate(dataSelecionavel));
  }

  const inicioSemana = startOfWeek(dataAtual, {
    weekStartsOn: 1,
  });

  const dias = Array.from({ length: 7 }, (_, index) => {
    const data = addDays(inicioSemana, index);

    return {
      value: formatDate(data),
      data,
      dia: format(data, "dd"),
      semana: format(data, "EEEEE", { locale: ptBR }).toUpperCase(),
      bloqueado: !podeSelecionar(data),
    };
  });

  const mes = format(dataAtual, "MMM", { locale: ptBR }).toUpperCase();
  const semanaAnterior = startOfWeek(addDays(dataAtual, -7), {
    weekStartsOn: 1,
  });
  const proximaSemana = startOfWeek(addDays(dataAtual, 7), {
    weekStartsOn: 1,
  });
  const podeVoltarSemana = semanaTemDataSelecionavel(semanaAnterior);
  const podeAvancarSemana = semanaTemDataSelecionavel(proximaSemana);

  return (
    <div className="mb-2">
      <div className="mb-2 flex w-full items-center gap-1 overflow-hidden">
        <button
          type="button"
          onClick={() => setMostrarCalendario((value) => !value)}
          className="w-8 shrink-0 text-left text-xs font-black text-zinc-900"
        >
          {mes}
        </button>

        <button
          type="button"
          onClick={voltarSemana}
          disabled={!podeVoltarSemana}
          className=""
        >
          <ChevronLeft className="h-3 w-3" />
        </button>

        <div className="flex flex-1 items-center gap-1">
          {dias.map((item) => {
            const ativo = item.value === dataSelecionada;

            return (
              <button
                key={item.value}
                type="button"
                disabled={item.bloqueado}
                onClick={() => onSelectData(item.value)}
                className={[
                  "flex h-12 flex-1 flex-col items-center justify-center gap-1 rounded-md text-xs font-black leading-none transition",
                  item.bloqueado
                    ? "cursor-not-allowed  text-zinc-300"
                    : ativo
                      ? "bg-white text-zinc-950"
                      : " text-zinc-900",
                ].join(" ")}
              >
                <span>{item.semana}</span>
                <span>{item.dia}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={avancarSemana}
          disabled={!podeAvancarSemana}
        >
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>

      {mostrarCalendario && (
        <div className=" w-fit rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm">
          <Calendar
            mode="single"
            selected={dataAtual}
            disabled={(date) => !podeSelecionar(date)}
            onSelect={(date) => {
              if (!date || !podeSelecionar(date)) return;

              onSelectData(formatDate(date));
              setMostrarCalendario(false);
            }}
            locale={ptBR}
            className="rounded-xl"
          />
        </div>
      )}
    </div>
  );
}
