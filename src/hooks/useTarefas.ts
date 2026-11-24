import { useEffect, useMemo, useState } from 'react';
import { ordenarTarefas } from '../domain/tarefas';
import { Tarefa } from '../domain/tipos';
import { DadosTarefaInput } from '../domain/validacoes';
import { carregarTarefas, salvarTarefas } from '../persistence/armazenamento';

export function useTarefas(onErroStorage: (msg: string) => void) {
  const [tarefas, setTarefas] = useState<Tarefa[]>(() => carregarTarefas().dados);

  useEffect(() => {
    const res = carregarTarefas();
    if (res.erro) onErroStorage(res.erro);
  }, [onErroStorage]);

  function persistir(lista: Tarefa[]) {
    setTarefas(lista);
    const erro = salvarTarefas(lista);
    if (erro) onErroStorage(erro);
  }

  function criarTarefa(dados: DadosTarefaInput) {
    const agora = Date.now();
    const nova: Tarefa = {
      id: crypto.randomUUID(),
      titulo: dados.titulo.trim(),
      estado: dados.estado,
      prioridade: dados.prioridade,
      criadaEm: agora,
      atualizadaEm: agora,
    };
    persistir([...tarefas, nova]);
  }

  function editarTarefa(id: string, dados: DadosTarefaInput) {
    const atualizadas = tarefas.map((t) =>
      t.id === id
        ? {
            ...t,
            titulo: dados.titulo.trim(),
            estado: dados.estado,
            prioridade: dados.prioridade,
            atualizadaEm: Date.now(),
          }
        : t
    );
    persistir(atualizadas);
  }

  function excluirTarefa(id: string) {
    persistir(tarefas.filter((t) => t.id !== id));
  }

  const tarefasOrdenadas = useMemo(() => ordenarTarefas(tarefas), [tarefas]);

  return {
    tarefas: tarefasOrdenadas,
    criarTarefa,
    editarTarefa,
    excluirTarefa,
  };
}
