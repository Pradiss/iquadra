"use client";

import { AgendaCard } from "./agenda-card";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Horario = {
  id: string;
  hora: string;
  horaFim: string;
  quadraId: string;
  quadraNome: string;
  disponivel: boolean;
  motivo: "JOGO" | "AULA" | "BLOQUEADO" | null;
  capacidadeMinima: number;
  capacidadeMaxima: number;
  permiteSimples: boolean;
  permiteDupla: boolean;
  jogadoresConfirmados: number;
  vagasDisponiveis: number;
  jogo?: {
    id: string;
    participantes: {
      id: string;
      nome: string;
      foto_perfil?: string | null;
      categoria?: string | null;
    }[];
    observacoes?: string | null;
  } | null;
};

type Props = {
  horarios: Horario[];
  onSelect: (horario: Horario) => void;
};

export function AgendaList({ horarios, onSelect }: Props) {
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Hora</TableHead>
            <TableHead>Quadra</TableHead>
            <TableHead>Jogadores</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {horarios.map((horario) => {
            const podeSelecionar =
              horario.disponivel ||
              Boolean(horario.jogo && horario.vagasDisponiveis > 0);

            return (
              <AgendaCard
                key={horario.id}
                horario={horario}
                onSelect={() => {
                  if (podeSelecionar) {
                    onSelect(horario);
                  }
                }}
              />
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}