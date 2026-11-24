import { EstadoTarefa, PrioridadeTarefa } from './tipos';

export interface DadosPresetInput {
  nome: string;
  tempoFocoMin: number;
  tempoPausaCurtaMin: number;
  ciclosAntesPausaLonga: number;
  tempoPausaLongaMin: number;
}

export interface DadosTarefaInput {
  titulo: string;
  estado: EstadoTarefa;
  prioridade: PrioridadeTarefa;
}

export function validarPreset(dados: DadosPresetInput): Record<string, string> {
  const erros: Record<string, string> = {};
  const nomeLimpo = dados.nome.trim();

  if (!nomeLimpo) {
    erros.nome = 'O nome do temporizador é obrigatório.';
  } else if (nomeLimpo.length > 40) {
    erros.nome = 'O nome deve ter no máximo 40 caracteres.';
  }

  if (!Number.isInteger(dados.tempoFocoMin) || dados.tempoFocoMin < 1 || dados.tempoFocoMin > 120) {
    erros.tempoFocoMin = 'Informe um número inteiro entre 1 e 120 minutos.';
  }

  if (!Number.isInteger(dados.tempoPausaCurtaMin) || dados.tempoPausaCurtaMin < 1 || dados.tempoPausaCurtaMin > 60) {
    erros.tempoPausaCurtaMin = 'Informe um número inteiro entre 1 e 60 minutos.';
  }

  if (!Number.isInteger(dados.ciclosAntesPausaLonga) || dados.ciclosAntesPausaLonga < 1 || dados.ciclosAntesPausaLonga > 12) {
    erros.ciclosAntesPausaLonga = 'Informe um número inteiro entre 1 e 12 ciclos.';
  }

  if (!Number.isInteger(dados.tempoPausaLongaMin) || dados.tempoPausaLongaMin < 1 || dados.tempoPausaLongaMin > 60) {
    erros.tempoPausaLongaMin = 'Informe um número inteiro entre 1 e 60 minutos.';
  }

  return erros;
}

const ESTADOS_VALIDOS: EstadoTarefa[] = ['backlog', 'aFazer', 'emExecucao', 'concluida', 'cancelada'];
const PRIORIDADES_VALIDAS: PrioridadeTarefa[] = ['baixa', 'media', 'alta'];

export function validarTarefa(dados: DadosTarefaInput): Record<string, string> {
  const erros: Record<string, string> = {};
  const tituloLimpo = dados.titulo.trim();

  if (!tituloLimpo) {
    erros.titulo = 'O título da tarefa é obrigatório.';
  } else if (tituloLimpo.length > 100) {
    erros.titulo = 'O título deve ter no máximo 100 caracteres.';
  }

  if (!ESTADOS_VALIDOS.includes(dados.estado)) {
    erros.estado = 'Selecione um estado válido.';
  }

  if (!PRIORIDADES_VALIDAS.includes(dados.prioridade)) {
    erros.prioridade = 'Selecione uma prioridade válida.';
  }

  return erros;
}
