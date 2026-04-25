# PROJETO: PrintPulse 3D Management

Este documento serve como a Diretriz (D) para o desenvolvimento do PrintPulse 3D, um SaaS de gerenciamento industrial de impressão 3D.

## 1. Identidade Visual (Tokens)
- **Tema**: Dark (Industrial Precision).
- **Cores Principais**:
    - Background: `#15121b`
    - Primary (Purple): `#7C3AED` (Brand) / `#d2bbff` (Accent)
    - Secondary (Green): `#4ae176` (Status Ready/Online)
    - Accent (Cyan): Para barras de progresso e dados técnicos.
- **Tipografia**: Inter (Semicondensada para headers, 14px para dados).
- **Shapes**: Radius 12px para botões, 16px para containers.

## 2. Objetivos de Implementação
1. [ ] Extrair componentes do Stitch e converter para React/Vanilla CSS.
2. [ ] Implementar Sidebar fixa (260px) com navegação persistente.
3. [ ] Criar Dashboard de Monitoramento com High-Density data display.
4. [ ] Integrar com Supabase para persistência de dados de frota e logs.

## 3. Estrutura de Arquivos Previsível
- `src/components/`: Componentes visuais puros.
- `src/hooks/`: Lógica de sincronização com Supabase.
- `src/styles/`: `index.css` com variáveis de design tokens.
- `execution/`: Scripts para migração de banco e seeding de dados.

## 4. Regras de Estética (Premium)
- Usar **Glassmorphism** (`blur-20`) em modais.
- Efeito 3D sutil em botões primários (inner-glow).
- Monitoramento de temperatura e G-code usando fonte Monospace.

---
**Status**: Fase de Extração de Design Iniciada.
**Data de Início**: 25/04/2026
