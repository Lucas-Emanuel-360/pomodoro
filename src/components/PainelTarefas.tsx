import React, { useState } from 'react';
import { EstadoTarefa, PrioridadeTarefa, Tarefa } from '../domain/tipos';
import { DadosTarefaInput, validarTarefa } from '../domain/validacoes';

interface PainelTarefasProps {
  tarefas: Tarefa[];
  onCriar: (dados: DadosTarefaInput) => void;
  onEditar: (id: string, dados: DadosTarefaInput) => void;
  onSolicitarExclusao: (tarefa: Tarefa) => void;
}

const ROTULOS_ESTADO: Record<EstadoTarefa, string> = {
  backlog: 'Backlog',
  aFazer: 'A fazer',
  emExecucao: 'Em execução',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
};

const ROTULOS_PRIORIDADE: Record<PrioridadeTarefa, string> = {
  alta: 'Alta',
  media: 'Média',
  baixa: 'Baixa',
};

export const PainelTarefas: React.FC<PainelTarefasProps> = ({
  tarefas,
  onCriar,
  onEditar,
  onSolicitarExclusao,
}) => {
  const [formularioAberto, setFormularioAberto] = useState(false);
  const [tarefaEdicao, setTarefaEdicao] = useState<Tarefa | null>(null);

  const [titulo, setTitulo] = useState('');
  const [estado, setEstado] = useState<EstadoTarefa>('backlog');
  const [prioridade, setPrioridade] = useState<PrioridadeTarefa>('media');
  const [erros, setErros] = useState<Record<string, string>>({});

  function abrirCriacao() {
    setTarefaEdicao(null);
    setTitulo('');
    setEstado('backlog');
    setPrioridade('media');
    setErros({});
    setFormularioAberto(true);
  }

  function abrirEdicao(tarefa: Tarefa) {
    setTarefaEdicao(tarefa);
    setTitulo(tarefa.titulo);
    setEstado(tarefa.estado);
    setPrioridade(tarefa.prioridade);
    setErros({});
    setFormularioAberto(true);
  }

  function cancelarFormulario() {
    setFormularioAberto(false);
    setTarefaEdicao(null);
    setErros({});
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const dados: DadosTarefaInput = { titulo, estado, prioridade };
    const validacao = validarTarefa(dados);

    if (Object.keys(validacao).length > 0) {
      setErros(validacao);
      return;
    }

    if (tarefaEdicao) {
      onEditar(tarefaEdicao.id, dados);
    } else {
      onCriar(dados);
    }
    cancelarFormulario();
  }

  return (
    <aside className="painel-tarefas" aria-label="Painel de tarefas">
      <div className="cabecalho-secao">
        <h2>Tarefas</h2>
        <button type="button" className="btn-primario" onClick={abrirCriacao}>
          + Nova tarefa
        </button>
      </div>

      {formularioAberto && (
        <form className="card-formulario" onSubmit={handleSubmit} noValidate>
          <h3>{tarefaEdicao ? 'Editar tarefa' : 'Nova tarefa'}</h3>

          <div className="campo">
            <label htmlFor="tarefa-titulo">Título</label>
            <input
              id="tarefa-titulo"
              type="text"
              maxLength={100}
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex.: Resolver lista de exercícios"
            />
            {erros.titulo && <span className="erro-campo">{erros.titulo}</span>}
          </div>

          <div className="grid-campos">
            <div className="campo">
              <label htmlFor="tarefa-estado">Estado</label>
              <select
                id="tarefa-estado"
                value={estado}
                onChange={(e) => setEstado(e.target.value as EstadoTarefa)}
              >
                <option value="backlog">Backlog</option>
                <option value="aFazer">A fazer</option>
                <option value="emExecucao">Em execução</option>
                <option value="concluida">Concluída</option>
                <option value="cancelada">Cancelada</option>
              </select>
              {erros.estado && <span className="erro-campo">{erros.estado}</span>}
            </div>

            <div className="campo">
              <label htmlFor="tarefa-prioridade">Prioridade</label>
              <select
                id="tarefa-prioridade"
                value={prioridade}
                onChange={(e) => setPrioridade(e.target.value as PrioridadeTarefa)}
              >
                <option value="alta">Alta</option>
                <option value="media">Média</option>
                <option value="baixa">Baixa</option>
              </select>
              {erros.prioridade && <span className="erro-campo">{erros.prioridade}</span>}
            </div>
          </div>

          <div className="acoes-form">
            <button type="button" className="btn-secundario" onClick={cancelarFormulario}>
              Cancelar
            </button>
            <button type="submit" className="btn-primario">
              Salvar tarefa
            </button>
          </div>
        </form>
      )}

      {tarefas.length === 0 ? (
        <p className="texto-vazio">Nenhuma tarefa registrada.</p>
      ) : (
        <ul className="lista-tarefas">
          {tarefas.map((tarefa) => (
            <li key={tarefa.id} className={`item-tarefa estado-${tarefa.estado}`}>
              <div className="conteudo-tarefa">
                <div className="badges-tarefa">
                  <span className={`badge-prioridade prio-${tarefa.prioridade}`}>
                    {ROTULOS_PRIORIDADE[tarefa.prioridade]}
                  </span>
                  <span className="badge-estado">{ROTULOS_ESTADO[tarefa.estado]}</span>
                </div>
                <p className="titulo-tarefa">{tarefa.titulo}</p>
              </div>

              <div className="acoes-tarefa">
                <button
                  type="button"
                  className="btn-secundario"
                  onClick={() => abrirEdicao(tarefa)}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="btn-perigo"
                  onClick={() => onSolicitarExclusao(tarefa)}
                >
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
};
