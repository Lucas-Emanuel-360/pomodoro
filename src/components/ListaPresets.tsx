import React from 'react';
import { TemporizadorPersonalizado } from '../domain/tipos';

interface ListaPresetsProps {
  presets: TemporizadorPersonalizado[];
  presetSelecionadoId: string | null;
  presetEmSessaoId: string | null;
  onSelecionar: (preset: TemporizadorPersonalizado) => void;
  onNovo: () => void;
  onEditar: (preset: TemporizadorPersonalizado) => void;
  onSolicitarExclusao: (preset: TemporizadorPersonalizado) => void;
}

export const ListaPresets: React.FC<ListaPresetsProps> = ({
  presets,
  presetSelecionadoId,
  presetEmSessaoId,
  onSelecionar,
  onNovo,
  onEditar,
  onSolicitarExclusao,
}) => {
  return (
    <section className="secao-presets" aria-label="Temporizadores personalizados">
      <div className="cabecalho-secao">
        <h2>Temporizadores</h2>
        <button type="button" className="btn-primario" onClick={onNovo}>
          + Novo temporizador
        </button>
      </div>

      {presets.length === 0 ? (
        <p className="texto-vazio">Nenhum temporizador cadastrado.</p>
      ) : (
        <ul className="lista-presets">
          {presets.map((preset) => {
            const emUso = preset.id === presetEmSessaoId;
            const selecionado = preset.id === presetSelecionadoId;

            return (
              <li
                key={preset.id}
                className={`item-preset ${selecionado ? 'selecionado' : ''} ${emUso ? 'em-uso' : ''}`}
              >
                <div className="info-preset" onClick={() => onSelecionar(preset)}>
                  <div className="titulo-preset">
                    <strong>{preset.nome}</strong>
                    {emUso && <span className="badge-ativo">Em sessão</span>}
                  </div>
                  <small>
                    Foco: {preset.tempoFocoMin}m • Curta: {preset.tempoPausaCurtaMin}m • Longa:{' '}
                    {preset.tempoPausaLongaMin}m ({preset.ciclosAntesPausaLonga} ciclos)
                  </small>
                </div>

                <div className="acoes-preset">
                  <button
                    type="button"
                    className="btn-secundario"
                    onClick={() => onSelecionar(preset)}
                  >
                    {emUso ? 'Ativo' : 'Usar'}
                  </button>
                  <button
                    type="button"
                    className="btn-secundario"
                    disabled={emUso}
                    title={
                      emUso
                        ? 'Não é possível editar um temporizador em uso por sessão ativa.'
                        : 'Editar temporizador'
                    }
                    onClick={() => onEditar(preset)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="btn-perigo"
                    disabled={emUso}
                    title={
                      emUso
                        ? 'Não é possível excluir um temporizador em uso por sessão ativa.'
                        : 'Excluir temporizador'
                    }
                    onClick={() => onSolicitarExclusao(preset)}
                  >
                    Excluir
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};
