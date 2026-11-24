# Aplicação Web de Gestão de Foco (Pomodoro)

Aplicação web desenvolvida em **TypeScript** e **React** com persistência local em `localStorage`, interface em português e layout responsivo.

**Acesse a aplicação online:** [https://pomodoro-olive-omega.vercel.app/](https://pomodoro-olive-omega.vercel.app/)

## Funcionalidades Implementadas

- **Temporizadores Personalizados (Presets):** Criação, edição, exclusão (com confirmação) e listagem, respeitando validações (`VR-01` a `VR-05`) e bloqueio de edição/exclusão quando em uso por sessão ativa (`RN-01`).
- **Execução de Sessões:** Fases de foco, pausa curta e pausa longa utilizando *snapshot* imutável do preset (`RN-05`), com controles de iniciar, pausar, retomar, pular fase (`RN-03`), reiniciar ciclos (`RN-04`), encerrar sessão e troca automática de preset (`RN-02`).
- **Persistência e Retomada Automática:** Recálculo baseado em timestamps absolutos ao reabrir o navegador (`RN-06`, `RN-07`, `RN-08`) e opção de descartar sessão retomada (`UC11`).
- **Alerta Sonoro:** Emissão sonora via Web Audio API ao fim de cada fase (`RF-14`, `RN-13`).
- **Painel Lateral de Tarefas:** Criação, edição e exclusão com confirmação obrigatória (`RN-11`), valores padrão (`backlog` e `média`, `RN-12`) e ordenação fixa por prioridade decrescente e estado (`RN-10`).

## Como Executar

```bash
npm install
npm run dev
