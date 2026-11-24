import { criarPresetsPadrao } from '../domain/presets';
import { SessaoAtiva, Tarefa, TemporizadorPersonalizado } from '../domain/tipos';

const CHAVES = {
  PRESETS: 'pomodoro.presets',
  TAREFAS: 'pomodoro.tarefas',
  SESSAO_ATIVA: 'pomodoro.sessaoAtiva',
} as const;

export interface ResultadoLeitura<T> {
  dados: T;
  erro?: string;
}

export function carregarPresets(): ResultadoLeitura<TemporizadorPersonalizado[]> {
  try {
    const bruto = localStorage.getItem(CHAVES.PRESETS);
    if (!bruto) {
      const padroes = criarPresetsPadrao();
      salvarPresets(padroes);
      return { dados: padroes };
    }
    const parsed = JSON.parse(bruto);
    if (!Array.isArray(parsed)) throw new Error('Formato inválido de presets.');
    return { dados: parsed };
  } catch {
    return {
      dados: criarPresetsPadrao(),
      erro: 'Não foi possível ler os temporizadores salvos. Valores padrão carregados.',
    };
  }
}

export function salvarPresets(presets: TemporizadorPersonalizado[]): string | null {
  try {
    localStorage.setItem(CHAVES.PRESETS, JSON.stringify(presets));
    return null;
  } catch {
    return 'Erro ao salvar temporizadores no Local Storage.';
  }
}

export function carregarTarefas(): ResultadoLeitura<Tarefa[]> {
  try {
    const bruto = localStorage.getItem(CHAVES.TAREFAS);
    if (!bruto) return { dados: [] };
    const parsed = JSON.parse(bruto);
    if (!Array.isArray(parsed)) throw new Error('Formato inválido de tarefas.');
    return { dados: parsed };
  } catch {
    return {
      dados: [],
      erro: 'Não foi possível ler as tarefas salvas no Local Storage.',
    };
  }
}

export function salvarTarefas(tarefas: Tarefa[]): string | null {
  try {
    localStorage.setItem(CHAVES.TAREFAS, JSON.stringify(tarefas));
    return null;
  } catch {
    return 'Erro ao salvar tarefas no Local Storage.';
  }
}

export function carregarSessaoAtiva(): ResultadoLeitura<SessaoAtiva | null> {
  try {
    const bruto = localStorage.getItem(CHAVES.SESSAO_ATIVA);
    if (!bruto) return { dados: null };
    const parsed = JSON.parse(bruto) as SessaoAtiva;
    if (!parsed || !parsed.id || !parsed.snapshotPreset || !parsed.faseAtual) {
      throw new Error('Sessão corrompida.');
    }
    return { dados: parsed };
  } catch {
    return {
      dados: null,
      erro: 'A sessão salva estava corrompida e foi descartada.',
    };
  }
}

export function salvarSessaoAtiva(sessao: SessaoAtiva | null): string | null {
  try {
    if (!sessao) {
      localStorage.removeItem(CHAVES.SESSAO_ATIVA);
    } else {
      localStorage.setItem(CHAVES.SESSAO_ATIVA, JSON.stringify(sessao));
    }
    return null;
  } catch {
    return 'Erro ao atualizar a sessão ativa no Local Storage.';
  }
}
