import { useEffect, useState } from 'react';
import {
  avancarParaProximaFase,
  iniciarNovaSessao,
  obterDuracaoFaseMs,
  recalcularSessaoAoCarregar,
} from '../domain/sessao';
import { SessaoAtiva, TemporizadorPersonalizado } from '../domain/tipos';
import { carregarSessaoAtiva, salvarSessaoAtiva } from '../persistence/armazenamento';
import { desbloquearAudio, tocarAlertaFimFase } from '../utils/audio';

export function useSessaoPomodoro(onErroStorage: (msg: string) => void) {
  const [sessao, setSessao] = useState<SessaoAtiva | null>(() => {
    const res = carregarSessaoAtiva();
    if (!res.dados) return null;
    const recalculada = recalcularSessaoAoCarregar(res.dados, Date.now());
    salvarSessaoAtiva(recalculada);
    return recalculada;
  });

  const [agoraMs, setAgoraMs] = useState<number>(() => Date.now());

  useEffect(() => {
    const res = carregarSessaoAtiva();
    if (res.erro) onErroStorage(res.erro);
  }, [onErroStorage]);

  function atualizarSessao(nova: SessaoAtiva | null) {
    setSessao(nova);
    const erro = salvarSessaoAtiva(nova);
    if (erro) onErroStorage(erro);
  }

  useEffect(() => {
    if (!sessao || sessao.status !== 'emAndamento') return;

    const intervalo = window.setInterval(() => {
      const agora = Date.now();
      setAgoraMs(agora);

      if (agora >= sessao.fimFasePrevistoEm) {
        const proxima = avancarParaProximaFase(sessao, 'conclusao', agora);
        tocarAlertaFimFase(proxima?.faseAtual);
        atualizarSessao(proxima);
      }
    }, 250);

    return () => window.clearInterval(intervalo);
  }, [sessao]);

  function iniciar(preset: TemporizadorPersonalizado) {
    desbloquearAudio();
    const agora = Date.now();
    setAgoraMs(agora);
    const nova = iniciarNovaSessao(preset, agora);
    atualizarSessao(nova);
  }

  function pausar() {
    if (!sessao || sessao.status !== 'emAndamento') return;
    const agora = Date.now();
    const restante = Math.max(0, sessao.fimFasePrevistoEm - agora);
    atualizarSessao({
      ...sessao,
      status: 'pausada',
      pausadaEm: agora,
      tempoRestanteAoPausarMs: restante,
      atualizadaEm: agora,
    });
  }

  function retomar() {
    if (!sessao || sessao.status !== 'pausada') return;
    desbloquearAudio();
    const agora = Date.now();
    const restante = sessao.tempoRestanteAoPausarMs ?? 0;
    setAgoraMs(agora);
    atualizarSessao({
      ...sessao,
      status: 'emAndamento',
      fimFasePrevistoEm: agora + restante,
      pausadaEm: null,
      tempoRestanteAoPausarMs: null,
      atualizadaEm: agora,
      retomadaAutomaticamente: false,
    });
  }

  function pularFase() {
    if (!sessao || sessao.status === 'concluida') return;
    desbloquearAudio();
    const agora = Date.now();
    setAgoraMs(agora);
    const proxima = avancarParaProximaFase(sessao, 'pulo', agora);
    tocarAlertaFimFase(proxima?.faseAtual);
    atualizarSessao(proxima);
  }

  function reiniciarCiclos() {
    if (!sessao) return;
    desbloquearAudio();
    const agora = Date.now();
    const duracaoMs = obterDuracaoFaseMs(sessao.snapshotPreset, 'foco');
    setAgoraMs(agora);
    atualizarSessao({
      ...sessao,
      faseAtual: 'foco',
      cicloAtual: 1,
      status: 'emAndamento',
      inicioFaseEm: agora,
      fimFasePrevistoEm: agora + duracaoMs,
      pausadaEm: null,
      tempoRestanteAoPausarMs: null,
      atualizadaEm: agora,
      retomadaAutomaticamente: false,
    });
  }

  function encerrarOuDescartar() {
    atualizarSessao(null);
  }

  const tempoRestanteMs = !sessao
    ? 0
    : sessao.status === 'concluida'
      ? 0
      : sessao.status === 'pausada'
        ? sessao.tempoRestanteAoPausarMs ?? 0
        : Math.max(0, sessao.fimFasePrevistoEm - agoraMs);

  return {
    sessao,
    tempoRestanteMs,
    iniciar,
    pausar,
    retomar,
    pularFase,
    reiniciarCiclos,
    encerrarOuDescartar,
  };
}