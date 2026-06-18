export const APP_TIME_ZONE = "America/Sao_Paulo";

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: APP_TIME_ZONE,
  hourCycle: "h23",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

export type LocalPeriodInput = {
  data: string;
  hora_inicio: string;
  hora_fim: string;
};

export type IsoPeriodInput = {
  inicio_em: string;
  fim_em: string;
};

export type TimeSlot = {
  inicio: string;
  fim: string;
};

function parseDateOnly(data: string) {
  const [year, month, day] = data.split("-").map(Number);

  return { year, month, day };
}

function parseTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number);

  return { hours, minutes };
}

function formatDateFromUtc(date: Date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getTimeZoneOffsetMs(date: Date) {
  const parts = dateTimeFormatter.formatToParts(date);
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)])
  );

  const zonedTimeAsUtc = Date.UTC(
    values.year,
    values.month - 1,
    values.day,
    values.hour,
    values.minute,
    values.second
  );

  return zonedTimeAsUtc - date.getTime();
}

function getAppTimeZoneParts(date: Date) {
  const parts = dateTimeFormatter.formatToParts(date);

  return Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );
}

export function isValidDateOnly(data: string) {
  const { year, month, day } = parseDateOnly(data);
  const utcDate = new Date(Date.UTC(year, month - 1, day));

  return (
    utcDate.getUTCFullYear() === year &&
    utcDate.getUTCMonth() === month - 1 &&
    utcDate.getUTCDate() === day
  );
}

export function addDaysToDateOnly(data: string, days: number) {
  const { year, month, day } = parseDateOnly(data);
  const utcDate = new Date(Date.UTC(year, month - 1, day + days));

  return formatDateFromUtc(utcDate);
}

export function getDiaSemana(data: string) {
  const { year, month, day } = parseDateOnly(data);

  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export function timeToMinutes(time: string) {
  const { hours, minutes } = parseTime(time);

  return hours * 60 + minutes;
}

export function minutesToTime(minutes: number) {
  const hours = Math.floor(minutes / 60).toString().padStart(2, "0");
  const remainingMinutes = (minutes % 60).toString().padStart(2, "0");

  return `${hours}:${remainingMinutes}`;
}

export function buildDateTime(data: string, time: string) {
  const { year, month, day } = parseDateOnly(data);
  const { hours, minutes } = parseTime(time);
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hours, minutes));
  const firstOffset = getTimeZoneOffsetMs(utcGuess);
  const firstResult = new Date(utcGuess.getTime() - firstOffset);
  const secondOffset = getTimeZoneOffsetMs(firstResult);

  if (firstOffset !== secondOffset) {
    return new Date(utcGuess.getTime() - secondOffset);
  }

  return firstResult;
}

export function getLocalDayRange(data: string) {
  return {
    inicio: buildDateTime(data, "00:00"),
    fim: buildDateTime(addDaysToDateOnly(data, 1), "00:00"),
  };
}

export function resolvePeriod(data: LocalPeriodInput | IsoPeriodInput) {
  if ("data" in data) {
    return {
      inicio: buildDateTime(data.data, data.hora_inicio),
      fim: buildDateTime(data.data, data.hora_fim),
    };
  }

  return {
    inicio: new Date(data.inicio_em),
    fim: new Date(data.fim_em),
  };
}

export function formatInAppTimeZone(date: Date) {
  const parts = getAppTimeZoneParts(date);

  return {
    data: `${parts.year}-${parts.month}-${parts.day}`,
    hora: `${parts.hour}:${parts.minute}`,
  };
}

export function generateTimeSlots(
  abreAs: string,
  fechaAs: string,
  duracaoMinutos: number
) {
  const slots: TimeSlot[] = [];
  let atual = timeToMinutes(abreAs);
  const fim = timeToMinutes(fechaAs);

  while (atual + duracaoMinutos <= fim) {
    slots.push({
      inicio: minutesToTime(atual),
      fim: minutesToTime(atual + duracaoMinutos),
    });

    atual += duracaoMinutos;
  }

  return slots;
}

export function validarJanelaDeSlots(
  abreAs: string,
  fechaAs: string,
  duracaoMinutos: number
) {
  if (timeToMinutes(fechaAs) <= timeToMinutes(abreAs)) {
    throw new Error("Horario final deve ser maior que o horario inicial");
  }

  if (duracaoMinutos <= 0) {
    throw new Error("Duracao do slot deve ser maior que zero");
  }

  if (timeToMinutes(abreAs) + duracaoMinutos > timeToMinutes(fechaAs)) {
    throw new Error("O periodo precisa comportar pelo menos um slot completo");
  }
}
