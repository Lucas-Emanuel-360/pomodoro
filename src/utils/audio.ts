import type { FaseSessao } from '../domain/tipos';

let audioCtx: AudioContext | null = null;

export function desbloquearAudio(): void {
  try {
    if (!audioCtx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      void audioCtx.resume();
    }
  } catch {
    // Navegador sem suporte ou contexto bloqueado
  }
}

interface NotaAlerta {
  freq: number;
  atrasoSeg: number;
  duracaoSeg: number;
  picoGanho: number;
  onda?: OscillatorType;
}

function obterSequenciaPorProximaFase(proximaFase?: FaseSessao): NotaAlerta[] {
  // Mais grave ao iniciar fase de foco
  if (proximaFase === 'foco') {
    return [
      { freq: 246.94, atrasoSeg: 0, duracaoSeg: 0.24, picoGanho: 0.24, onda: 'triangle' },
      { freq: 196.0, atrasoSeg: 0.2, duracaoSeg: 0.36, picoGanho: 0.26, onda: 'triangle' },
    ];
  }

  // Mais alegre e ascendente ao iniciar pausa longa
  if (proximaFase === 'pausaLonga') {
    return [
      { freq: 523.25, atrasoSeg: 0, duracaoSeg: 0.16, picoGanho: 0.2, onda: 'sine' },
      { freq: 659.25, atrasoSeg: 0.14, duracaoSeg: 0.16, picoGanho: 0.22, onda: 'sine' },
      { freq: 783.99, atrasoSeg: 0.28, duracaoSeg: 0.16, picoGanho: 0.22, onda: 'sine' },
      { freq: 1046.5, atrasoSeg: 0.42, duracaoSeg: 0.34, picoGanho: 0.25, onda: 'sine' },
    ];
  }

  // Um pouco mais agudo para pausa curta (e fallback padrão)
  return [
    { freq: 880.0, atrasoSeg: 0, duracaoSeg: 0.16, picoGanho: 0.2, onda: 'sine' },
    { freq: 1046.5, atrasoSeg: 0.16, duracaoSeg: 0.24, picoGanho: 0.22, onda: 'sine' },
  ];
}

export function tocarAlertaFimFase(proximaFase?: FaseSessao): void {
  try {
    desbloquearAudio();
    if (!audioCtx) return;

    const agora = audioCtx.currentTime;
    const notas = obterSequenciaPorProximaFase(proximaFase);

    notas.forEach(({ freq, atrasoSeg, duracaoSeg, picoGanho, onda = 'sine' }) => {
      if (!audioCtx) return;

      const inicio = agora + atrasoSeg;
      const fim = inicio + duracaoSeg;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = onda;
      osc.frequency.setValueAtTime(freq, inicio);

      gain.gain.setValueAtTime(0.001, inicio);
      gain.gain.exponentialRampToValueAtTime(picoGanho, inicio + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.001, fim);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(inicio);
      osc.stop(fim + 0.02);
    });
  } catch {
    // Falha silenciosa se bloqueado por autoplay
  }
}