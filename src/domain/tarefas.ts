import { EstadoTarefa, PrioridadeTarefa, Tarefa } from './tipos';

const PESO_PRIORIDADE: Record<PrioridadeTarefa, number> = {
  alta: 3,
  media: 2,
  baixa: 1,
};

const ORDEM_ESTADO: Record<EstadoTarefa, number> = {
  aFazer: 1,
  emExecucao: 2,
  concluida: 3,
  cancelada: 4,
  backlog: 5,
};

export function ordenarTarefas(tarefas: Tarefa[]): Tarefa[] {
  return [...tarefas].sort((a, b) => {
    const diffPrioridade = PESO_PRIORIDADE[b.prioridade] - PESO_PRIORIDADE[a.prioridade];
    if (diffPrioridade !== 0) return diffPrioridade;

    const diffEstado = ORDEM_ESTADO[a.estado] - ORDEM_ESTADO[b.estado];
    if (diffEstado !== 0) return diffEstado;

    return a.criadaEm - b.criadaEm;
  });
}
