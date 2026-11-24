import { useCallback, useEffect, useState } from 'react';
import { DialogoConfirmacao } from './components/DialogoConfirmacao';
import { FormularioPreset } from './components/FormularioPreset';
import { ListaPresets } from './components/ListaPresets';
import { PainelTarefas } from './components/PainelTarefas';
import { PainelTemporizador } from './components/PainelTemporizador';
import { Tarefa, TemporizadorPersonalizado } from './domain/tipos';
import { DadosPresetInput } from './domain/validacoes';
import { usePresets } from './hooks/usePresets';
import { useSessaoPomodoro } from './hooks/useSessaoPomodoro';
import { useTarefas } from './hooks/useTarefas';

type ConfirmacaoPendente =
  | { tipo: 'excluirPreset'; preset: TemporizadorPersonalizado }
  | { tipo: 'excluirTarefa'; tarefa: Tarefa }
  | { tipo: 'reiniciarCiclos' }
  | { tipo: 'encerrarSessao' }
  | { tipo: 'descartarSessao' }
  | null;

export function App() {
  const [erroStorage, setErroStorage] = useState<string | null>(null);
  const reportarErro = useCallback((msg: string) => setErroStorage(msg), []);

  const { presets, criarPreset, editarPreset, excluirPreset } = usePresets(reportarErro);
  const {
    sessao,
    tempoRestanteMs,
    iniciar,
    pausar,
    retomar,
    pularFase,
    reiniciarCiclos,
    encerrarOuDescartar,
  } = useSessaoPomodoro(reportarErro);
  const { tarefas, criarTarefa, editarTarefa, excluirTarefa } = useTarefas(reportarErro);

  const [presetSelecionadoId, setPresetSelecionadoId] = useState<string | null>(null);
  const [formPresetAberto, setFormPresetAberto] = useState(false);
  const [presetEmEdicao, setPresetEmEdicao] = useState<TemporizadorPersonalizado | null>(null);
  const [confirmacao, setConfirmacao] = useState<ConfirmacaoPendente>(null);

  useEffect(() => {
    if (sessao) {
      setPresetSelecionadoId(sessao.presetId);
    } else if (!presetSelecionadoId && presets.length > 0) {
      setPresetSelecionadoId(presets[0].id);
    } else if (presetSelecionadoId && !presets.some((p) => p.id === presetSelecionadoId)) {
      setPresetSelecionadoId(presets[0]?.id ?? null);
    }
  }, [sessao, presets, presetSelecionadoId]);

  const presetSelecionado = presets.find((p) => p.id === presetSelecionadoId) ?? null;

  function handleSelecionarPreset(preset: TemporizadorPersonalizado) {
    setPresetSelecionadoId(preset.id);
    if (sessao && sessao.presetId !== preset.id) {
      iniciar(preset);
    }
  }

  function handleSalvarPreset(dados: DadosPresetInput) {
    if (presetEmEdicao) {
      editarPreset(presetEmEdicao.id, dados);
    } else {
      criarPreset(dados);
    }
    setFormPresetAberto(false);
    setPresetEmEdicao(null);
  }

  function executarConfirmacao() {
    if (!confirmacao) return;

    if (confirmacao.tipo === 'excluirPreset') {
      excluirPreset(confirmacao.preset.id);
    } else if (confirmacao.tipo === 'excluirTarefa') {
      excluirTarefa(confirmacao.tarefa.id);
    } else if (confirmacao.tipo === 'reiniciarCiclos') {
      reiniciarCiclos();
    } else if (confirmacao.tipo === 'encerrarSessao' || confirmacao.tipo === 'descartarSessao') {
      encerrarOuDescartar();
    }

    setConfirmacao(null);
  }

  function obterTextoConfirmacao() {
    if (!confirmacao) return { titulo: '', mensagem: '' };
    switch (confirmacao.tipo) {
      case 'excluirPreset':
        return {
          titulo: 'Excluir temporizador',
          mensagem: `Deseja realmente excluir o temporizador "${confirmacao.preset.nome}"?`,
        };
      case 'excluirTarefa':
        return {
          titulo: 'Excluir tarefa',
          mensagem: `Deseja realmente excluir a tarefa "${confirmacao.tarefa.titulo}"?`,
        };
      case 'reiniciarCiclos':
        return {
          titulo: 'Reiniciar ciclos',
          mensagem: 'A contagem voltará para o ciclo 1 na fase de foco. Deseja continuar?',
        };
      case 'encerrarSessao':
        return {
          titulo: 'Encerrar sessão',
          mensagem: 'Deseja encerrar a sessão ativa atual?',
        };
      case 'descartarSessao':
        return {
          titulo: 'Descartar sessão retomada',
          mensagem: 'A sessão retomada será removida sem contabilizar progresso. Confirmar?',
        };
    }
  }

  const dadosModal = obterTextoConfirmacao();
  const temaFase = sessao ? `tema-${sessao.faseAtual}` : 'tema-foco';

  return (
    <div className={`app-shell ${temaFase}`}>
      <div className="app-container">
        <header className="app-header">
          <div>
            <h1>Gestão de Foco</h1>
            <p className="marca-subtitulo">Ciclos Pomodoro e Tarefas de Estudo</p>
          </div>
        </header>

        {erroStorage && (
          <div className="alerta-erro" role="alert">
            <span>{erroStorage}</span>
            <button type="button" className="btn-secundario" onClick={() => setErroStorage(null)}>
              Fechar
            </button>
          </div>
        )}

        <main className="layout-principal">
          <div className="coluna-esquerda">
            <PainelTemporizador
              sessao={sessao}
              presetSelecionado={presetSelecionado}
              tempoRestanteMs={tempoRestanteMs}
              onIniciar={iniciar}
              onPausar={pausar}
              onRetomar={retomar}
              onPularFase={pularFase}
              onSolicitarReiniciar={() => setConfirmacao({ tipo: 'reiniciarCiclos' })}
              onSolicitarEncerrar={() => setConfirmacao({ tipo: 'encerrarSessao' })}
              onSolicitarDescartar={() => setConfirmacao({ tipo: 'descartarSessao' })}
            />

            {formPresetAberto && (
              <FormularioPreset
                presetEdicao={presetEmEdicao}
                onSalvar={handleSalvarPreset}
                onCancelar={() => {
                  setFormPresetAberto(false);
                  setPresetEmEdicao(null);
                }}
              />
            )}

            <ListaPresets
              presets={presets}
              presetSelecionadoId={presetSelecionadoId}
              presetEmSessaoId={sessao?.presetId ?? null}
              onSelecionar={handleSelecionarPreset}
              onNovo={() => {
                setPresetEmEdicao(null);
                setFormPresetAberto(true);
              }}
              onEditar={(preset) => {
                if (sessao?.presetId === preset.id) return;
                setPresetEmEdicao(preset);
                setFormPresetAberto(true);
              }}
              onSolicitarExclusao={(preset) => {
                if (sessao?.presetId === preset.id) return;
                setConfirmacao({ tipo: 'excluirPreset', preset });
              }}
            />
          </div>

          <PainelTarefas
            tarefas={tarefas}
            onCriar={criarTarefa}
            onEditar={editarTarefa}
            onSolicitarExclusao={(tarefa) => setConfirmacao({ tipo: 'excluirTarefa', tarefa })}
          />
        </main>

        <DialogoConfirmacao
          aberto={confirmacao !== null}
          titulo={dadosModal.titulo}
          mensagem={dadosModal.mensagem}
          onConfirmar={executarConfirmacao}
          onCancelar={() => setConfirmacao(null)}
        />
      </div>
    </div>
  );
}

export default App;