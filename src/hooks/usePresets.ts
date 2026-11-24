import { useEffect, useState } from 'react';
import { TemporizadorPersonalizado } from '../domain/tipos';
import { DadosPresetInput } from '../domain/validacoes';
import { carregarPresets, salvarPresets } from '../persistence/armazenamento';

export function usePresets(onErroStorage: (msg: string) => void) {
  const [presets, setPresets] = useState<TemporizadorPersonalizado[]>(() => {
    const res = carregarPresets();
    return res.dados;
  });

  useEffect(() => {
    const res = carregarPresets();
    if (res.erro) onErroStorage(res.erro);
  }, [onErroStorage]);

  function persistir(lista: TemporizadorPersonalizado[]) {
    setPresets(lista);
    const erro = salvarPresets(lista);
    if (erro) onErroStorage(erro);
  }

  function criarPreset(dados: DadosPresetInput) {
    const agora = Date.now();
    const novo: TemporizadorPersonalizado = {
      id: crypto.randomUUID(),
      nome: dados.nome.trim(),
      tempoFocoMin: dados.tempoFocoMin,
      tempoPausaCurtaMin: dados.tempoPausaCurtaMin,
      ciclosAntesPausaLonga: dados.ciclosAntesPausaLonga,
      tempoPausaLongaMin: dados.tempoPausaLongaMin,
      criadoEm: agora,
      atualizadoEm: agora,
    };
    persistir([...presets, novo]);
  }

  function editarPreset(id: string, dados: DadosPresetInput) {
    const atualizados = presets.map((p) =>
      p.id === id
        ? {
            ...p,
            nome: dados.nome.trim(),
            tempoFocoMin: dados.tempoFocoMin,
            tempoPausaCurtaMin: dados.tempoPausaCurtaMin,
            ciclosAntesPausaLonga: dados.ciclosAntesPausaLonga,
            tempoPausaLongaMin: dados.tempoPausaLongaMin,
            atualizadoEm: Date.now(),
          }
        : p
    );
    persistir(atualizados);
  }

  function excluirPreset(id: string) {
    persistir(presets.filter((p) => p.id !== id));
  }

  return {
    presets,
    criarPreset,
    editarPreset,
    excluirPreset,
  };
}
