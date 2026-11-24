import { TemporizadorPersonalizado } from './tipos';

export function criarPresetsPadrao(): TemporizadorPersonalizado[] {
  const agora = Date.now();
  return [
    {
      id: 'preset-classico',
      nome: 'Pomodoro Clássico',
      tempoFocoMin: 25,
      tempoPausaCurtaMin: 5,
      ciclosAntesPausaLonga: 4,
      tempoPausaLongaMin: 15,
      criadoEm: agora,
      atualizadoEm: agora,
    },
    {
      id: 'preset-estudo-longo',
      nome: 'Estudo Profundo',
      tempoFocoMin: 50,
      tempoPausaCurtaMin: 10,
      ciclosAntesPausaLonga: 3,
      tempoPausaLongaMin: 20,
      criadoEm: agora,
      atualizadoEm: agora,
    },
  ];
}
