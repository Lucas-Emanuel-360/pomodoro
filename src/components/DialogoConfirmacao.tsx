import React from 'react';

interface DialogoConfirmacaoProps {
  aberto: boolean;
  titulo: string;
  mensagem: string;
  textoConfirmar?: string;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export const DialogoConfirmacao: React.FC<DialogoConfirmacaoProps> = ({
  aberto,
  titulo,
  mensagem,
  textoConfirmar = 'Confirmar',
  onConfirmar,
  onCancelar,
}) => {
  if (!aberto) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-titulo">
      <div className="modal-card">
        <h3 id="modal-titulo">{titulo}</h3>
        <p>{mensagem}</p>
        <div className="modal-acoes">
          <button type="button" className="btn-secundario" onClick={onCancelar}>
            Cancelar
          </button>
          <button type="button" className="btn-perigo" onClick={onConfirmar}>
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
};
