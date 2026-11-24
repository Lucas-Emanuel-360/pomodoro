import React from 'react';
import { FaseSessao, SessaoAtiva, TemporizadorPersonalizado } from '../domain/tipos';

interface PainelTemporizadorProps {
  sessao: SessaoAtiva | null;
  presetSelecionado: TemporizadorPersonalizado | null;
  tempoRestanteMs: number;
  onIniciar: (preset: TemporizadorPersonalizado) => void;
  onPausar: () => void;
  onRetomar: () => void;
  onPularFase: () => void;
  onSolicitarReiniciar: () => void;
  onSolicitarEncerrar: () => void;
  onSolicitarDescartar: () => void;
}

const ROTULOS_FASE: Record<FaseSessao, string> = {
  foco: 'Foco',
  pausaCurta: 'Pausa curta',
  pausaLonga: 'Pausa longa',
};

function formatarRelogio(ms: number): string {
  const totalSegundos = Math.ceil(ms / 1000);
  const minutos = Math.floor(totalSegundos / 60);
  const segundos = totalSegundos % 60;
  return `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
}

function obterDuracaoTotalFaseMs(sessao: SessaoAtiva): number {
  const { snapshotPreset, faseAtual } = sessao;
  if (faseAtual === 'foco') return snapshotPreset.tempoFocoMin * 60 * 1000;
  if (faseAtual === 'pausaCurta') return snapshotPreset.tempoPausaCurtaMin * 60 * 1000;
  return snapshotPreset.tempoPausaLongaMin * 60 * 1000;
}

export const PainelTemporizador: React.FC<PainelTemporizadorProps> = ({
  sessao,
  presetSelecionado,
  tempoRestanteMs,
  onIniciar,
  onPausar,
  onRetomar,
  onPularFase,
  onSolicitarReiniciar,
  onSolicitarEncerrar,
  onSolicitarDescartar,
}) => {
  if (!sessao) {
    const tempoInicialMs = (presetSelecionado?.tempoFocoMin ?? 25) * 60 * 1000;

    return (
      <section className="card-temporizador" aria-label="Temporizador de foco">
        <div className="topo-sessao">
          <span className="tag-fase">Pronto para iniciar</span>
          {presetSelecionado && (
            <span className="contador-ciclos">
              {presetSelecionado.ciclosAntesPausaLonga} ciclos por bloco
            </span>
          )}
        </div>

        <div className="relogio-wrapper">
          <div className="relogio" aria-live="polite">
            {formatarRelogio(tempoInicialMs)}
          </div>
          <div className="barra-progresso-trilha" aria-hidden="true">
            <div className="barra-progresso-preenchimento" style={{ width: '0%' }} />
          </div>
        </div>

        <p className="subtitulo-sessao">
          {presetSelecionado
            ? `Temporizador selecionado: ${presetSelecionado.nome}`
            : 'Cadastre ou selecione um temporizador abaixo.'}
        </p>

        <div className="controles-sessao">
          <button
            type="button"
            className="btn-primario btn-grande"
            disabled={!presetSelecionado}
            onClick={() => presetSelecionado && onIniciar(presetSelecionado)}
          >
            Iniciar sessão
          </button>
        </div>
      </section>
    );
  }

  const { snapshotPreset, faseAtual, cicloAtual, status, retomadaAutomaticamente } = sessao;
  const duracaoTotalMs = obterDuracaoTotalFaseMs(sessao);
  const progressoPercent =
    status === 'concluida'
      ? 100
      : Math.min(100, Math.max(0, ((duracaoTotalMs - tempoRestanteMs) / duracaoTotalMs) * 100));

  return (
    <section
      className={`card-temporizador fase-${faseAtual}`}
      aria-label="Sessão ativa"
    >
      {retomadaAutomaticamente && status !== 'concluida' && (
        <div className="banner-retomada" role="status">
          <span>Sessão retomada automaticamente.</span>
          <button type="button" className="btn-link" onClick={onSolicitarDescartar}>
            Descartar sessão
          </button>
        </div>
      )}

      <div className="topo-sessao">
        <span className="tag-fase">
          {status === 'concluida' ? 'Sessão concluída' : ROTULOS_FASE[faseAtual]}
        </span>

        <span className="contador-ciclos">
          Ciclo {cicloAtual} de {snapshotPreset.ciclosAntesPausaLonga}
        </span>
      </div>

      <div className="relogio-wrapper">
        <div className="relogio" aria-live="polite">
          {formatarRelogio(tempoRestanteMs)}
        </div>
        <div className="barra-progresso-trilha" aria-hidden="true">
          <div
            className="barra-progresso-preenchimento"
            style={{ width: `${progressoPercent.toFixed(1)}%` }}
          />
        </div>
      </div>

      <p className="subtitulo-sessao">
        <strong>{snapshotPreset.nome}</strong>
        {status === 'pausada' && <span className="badge-pausada">Pausada</span>}
      </p>

      <div className="controles-sessao">
        {status === 'emAndamento' && (
          <button type="button" className="btn-primario btn-grande" onClick={onPausar}>
            Pausar
          </button>
        )}

        {status === 'pausada' && (
          <button type="button" className="btn-primario btn-grande" onClick={onRetomar}>
            Retomar
          </button>
        )}

        {status !== 'concluida' && (
          <button type="button" className="btn-secundario" onClick={onPularFase}>
            Pular fase
          </button>
        )}

        <button type="button" className="btn-secundario" onClick={onSolicitarReiniciar}>
          Reiniciar ciclos
        </button>

        <button type="button" className="btn-perigo" onClick={onSolicitarEncerrar}>
          {status === 'concluida' ? 'Finalizar' : 'Encerrar sessão'}
        </button>
      </div>
    </section>
  );
};