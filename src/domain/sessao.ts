import { FaseSessao, SessaoAtiva, SnapshotPreset, TemporizadorPersonalizado } from './tipos';

export function obterDuracaoFaseMs(snapshot: SnapshotPreset, fase: FaseSessao): number {
  if (fase === 'foco') return snapshot.tempoFocoMin * 60 * 1000;
  if (fase === 'pausaCurta') return snapshot.tempoPausaCurtaMin * 60 * 1000;
  return snapshot.tempoPausaLongaMin * 60 * 1000;
}

export function iniciarNovaSessao(preset: TemporizadorPersonalizado, agora = Date.now()): SessaoAtiva {
  const snapshotPreset: SnapshotPreset = {
    nome: preset.nome,
    tempoFocoMin: preset.tempoFocoMin,
    tempoPausaCurtaMin: preset.tempoPausaCurtaMin,
    ciclosAntesPausaLonga: preset.ciclosAntesPausaLonga,
    tempoPausaLongaMin: preset.tempoPausaLongaMin,
  };

  const duracaoMs = obterDuracaoFaseMs(snapshotPreset, 'foco');

  return {
    id: crypto.randomUUID(),
    presetId: preset.id,
    snapshotPreset,
    faseAtual: 'foco',
    cicloAtual: 1,
    status: 'emAndamento',
    inicioFaseEm: agora,
    fimFasePrevistoEm: agora + duracaoMs,
    pausadaEm: null,
    tempoRestanteAoPausarMs: null,
    criadaEm: agora,
    atualizadaEm: agora,
    retomadaAutomaticamente: false,
  };
}

export function avancarParaProximaFase(
  sessao: SessaoAtiva,
  motivo: 'conclusao' | 'pulo',
  agora = Date.now()
): SessaoAtiva | null {
  const { faseAtual, cicloAtual, snapshotPreset } = sessao;
  const maxCiclos = snapshotPreset.ciclosAntesPausaLonga;

  if (faseAtual === 'foco') {
    const proximaFase: FaseSessao = cicloAtual >= maxCiclos ? 'pausaLonga' : 'pausaCurta';
    const duracaoMs = obterDuracaoFaseMs(snapshotPreset, proximaFase);

    return {
      ...sessao,
      faseAtual: proximaFase,
      status: 'emAndamento',
      inicioFaseEm: agora,
      fimFasePrevistoEm: agora + duracaoMs,
      pausadaEm: null,
      tempoRestanteAoPausarMs: null,
      atualizadaEm: agora,
    };
  }

  if (faseAtual === 'pausaLonga') {
    return {
      ...sessao,
      status: 'concluida',
      pausadaEm: null,
      tempoRestanteAoPausarMs: 0,
      atualizadaEm: agora,
    };
  }

  const proximoCiclo = motivo === 'conclusao' ? cicloAtual + 1 : cicloAtual;
  const duracaoMs = obterDuracaoFaseMs(snapshotPreset, 'foco');

  return {
    ...sessao,
    faseAtual: 'foco',
    cicloAtual: proximoCiclo,
    status: 'emAndamento',
    inicioFaseEm: agora,
    fimFasePrevistoEm: agora + duracaoMs,
    pausadaEm: null,
    tempoRestanteAoPausarMs: null,
    atualizadaEm: agora,
  };
}

export function recalcularSessaoAoCarregar(sessao: SessaoAtiva, agora = Date.now()): SessaoAtiva {
  if (sessao.status === 'concluida') {
    return sessao;
  }

  if (sessao.status === 'pausada') {
    return {
      ...sessao,
      retomadaAutomaticamente: true,
    };
  }

  let atual: SessaoAtiva = {
    ...sessao,
    retomadaAutomaticamente: true,
  };

  while (atual.status === 'emAndamento' && agora >= atual.fimFasePrevistoEm) {
    const fimAnterior = atual.fimFasePrevistoEm;
    const proxima = avancarParaProximaFase(atual, 'conclusao', fimAnterior);
    if (!proxima) break;
    atual = {
      ...proxima,
      retomadaAutomaticamente: true,
    };
  }

  return atual;
}
