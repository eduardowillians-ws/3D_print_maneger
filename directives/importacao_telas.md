# SOP: Importação de Telas do Stitch

Este procedimento define como transformar as telas conceituais do Stitch em componentes React funcionais.

## 1. Preparação
1. Identificar o ID da tela no Stitch (usando `get_project` ou `list_screens`).
2. Obter os metadados da tela (`get_screen`).

## 2. Processo de Conversão (D-O-E)
*   **Directive (D)**: Definir a função do componente e suas dependências.
*   **Orchestration (O)**: Eu (Antigravity) mapeio o layout visual para a estrutura do `App.tsx` ou novos componentes em `src/components/`.
*   **Execution (E)**: Usar o código gerado pelo Stitch (se disponível) ou escrever o JSX responsivo manualmente seguindo os design tokens.

## 3. Prioridade de Telas (PrintPulse)
1. **Screen: `Dashboard Principal`**: Visão geral da frota.
2. **Screen: `Fleet Details`**: Detalhes de uma impressora específica.
3. **Screen: `Logs & Analytics`**: Histórico de impressões.

## 4. Checklist de Qualidade
- [ ] O componente usa variáveis CSS do `index.css`.
- [ ] Implementa Framer Motion para entradas suaves.
- [ ] Ícones seguem o padrão Lucide.
- [ ] Layout é responsivo (padrão Desktop primeiro).

---
**Data**: 25/04/2026
