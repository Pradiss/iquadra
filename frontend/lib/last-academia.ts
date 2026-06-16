const KEY = "iquadra_ultima_academia_id";

export function salvarUltimaAcademia(id: string) {
  localStorage.setItem(KEY, id);
}

export function buscarUltimaAcademia() {
  return localStorage.getItem(KEY);
}

export function limparUltimaAcademia() {
  localStorage.removeItem(KEY);
}