import React, { useEffect, useState } from 'react';
import { TemporizadorPersonalizado } from '../domain/tipos';
import { DadosPresetInput, validarPreset } from '../domain/validacoes';

interface FormularioPresetProps {
  presetEdicao: TemporizadorPersonalizado | null;
  onSalvar: (dados: DadosPresetInput) => void;
  onCancelar: () => void;
}

export const FormularioPreset: React.FC<FormularioPresetProps> = ({
  presetEdicao,
  onSalvar,
  onCancelar,
}) => {
  const [nome, setNome] = useState('');
  const [tempoFocoMin, setTempoFocoMin] = useState('25');
  const [tempoPausaCurtaMin, setTempoPausaCurtaMin] = useState('5');
  const [ciclosAntesPausaLonga, setCiclosAntesPausaLonga] = useState('4');
  const [tempoPausaLongaMin, setTempoPausaLongaMin] = useState('15');
  const [erros, setErros] = useState<Record<string, string>>({});

  useEffect(() => {
    if (presetEdicao) {
      setNome(presetEdicao.nome);
      setTempoFocoMin(String(presetEdicao.tempoFocoMin));
      setTempoPausaCurtaMin(String(presetEdicao.tempoPausaCurtaMin));
      setCiclosAntesPausaLonga(String(presetEdicao.ciclosAntesPausaLonga));
      setTempoPausaLongaMin(String(presetEdicao.tempoPausaLongaMin));
    } else {
      setNome('');
      setTempoFocoMin('25');
      setTempoPausaCurtaMin('5');
      setCiclosAntesPausaLonga('4');
      setTempoPausaLongaMin('15');
    }
    setErros({});
  }, [presetEdicao]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const dados: DadosPresetInput = {
      nome,
      tempoFocoMin: Number(tempoFocoMin),
      tempoPausaCurtaMin: Number(tempoPausaCurtaMin),
      ciclosAntesPausaLonga: Number(ciclosAntesPausaLonga),
      tempoPausaLongaMin: Number(tempoPausaLongaMin),
    };

    const validacao = validarPreset(dados);
    if (Object.keys(validacao).length > 0) {
      setErros(validacao);
      return;
    }

    onSalvar(dados);
  }

  return (
    <form className="card-formulario" onSubmit={handleSubmit} noValidate>
      <h3>{presetEdicao ? 'Editar temporizador' : 'Novo temporizador'}</h3>

      <div className="campo">
        <label htmlFor="preset-nome">Nome do temporizador</label>
        <input
          id="preset-nome"
          type="text"
          maxLength={40}
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex.: Revisão de Cálculo"
        />
        {erros.nome && <span className="erro-campo">{erros.nome}</span>}
      </div>

      <div className="grid-campos">
        <div className="campo">
          <label htmlFor="preset-foco">Foco (min)</label>
          <input
            id="preset-foco"
            type="number"
            min={1}
            max={120}
            value={tempoFocoMin}
            onChange={(e) => setTempoFocoMin(e.target.value)}
          />
          {erros.tempoFocoMin && <span className="erro-campo">{erros.tempoFocoMin}</span>}
        </div>

        <div className="campo">
          <label htmlFor="preset-pausa-curta">Pausa curta (min)</label>
          <input
            id="preset-pausa-curta"
            type="number"
            min={1}
            max={60}
            value={tempoPausaCurtaMin}
            onChange={(e) => setTempoPausaCurtaMin(e.target.value)}
          />
          {erros.tempoPausaCurtaMin && <span className="erro-campo">{erros.tempoPausaCurtaMin}</span>}
        </div>

        <div className="campo">
          <label htmlFor="preset-ciclos">Ciclos até pausa longa</label>
          <input
            id="preset-ciclos"
            type="number"
            min={1}
            max={12}
            value={ciclosAntesPausaLonga}
            onChange={(e) => setCiclosAntesPausaLonga(e.target.value)}
          />
          {erros.ciclosAntesPausaLonga && (
            <span className="erro-campo">{erros.ciclosAntesPausaLonga}</span>
          )}
        </div>

        <div className="campo">
          <label htmlFor="preset-pausa-longa">Pausa longa (min)</label>
          <input
            id="preset-pausa-longa"
            type="number"
            min={1}
            max={60}
            value={tempoPausaLongaMin}
            onChange={(e) => setTempoPausaLongaMin(e.target.value)}
          />
          {erros.tempoPausaLongaMin && <span className="erro-campo">{erros.tempoPausaLongaMin}</span>}
        </div>
      </div>

      <div className="acoes-form">
        <button type="button" className="btn-secundario" onClick={onCancelar}>
          Cancelar
        </button>
        <button type="submit" className="btn-primario">
          Salvar temporizador
        </button>
      </div>
    </form>
  );
};
