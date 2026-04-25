---
name: gerenciando-saas-premium
description: Especialista na criação de interfaces SaaS de alto padrão, focando em estética premium, arquitetura limpa e integração com ecossistemas como Stitch e Supabase. Use quando o usuário solicitar desenvolvimento de novas funcionalidades, estruturação de projeto SaaS ou refatoração estética.
---

# Gerenciando SaaS Premium

## Quando usar esta skill
- Criação de novos projetos SaaS.
- Refatoração de interfaces para o padrão "Premium" (Glassmorphism, gradientes, tipografia moderna).
- Integração de designs do Stitch para código local.
- Estruturação de banco de dados no Supabase seguindo o padrão DOE.

## Fluxo de Trabalho (Workflow)
1. **Auditoria Estética**: Analise o "Design MD" do projeto no Stitch para extrair tokens de cor, sombras e tipografia.
2. **Definição de Componentes**: Mapeie os componentes necessários e verifique se seguem o padrão "No-Line" (sem bordas sólidas, separação tonal).
3. **Plano de Implementação**:
    - [ ] Criar/Atualizar `index.css` com o sistema de design (variáveis CSS).
    - [ ] Estruturar componentes React/Vite com logic-heavy separation.
    - [ ] Configurar Supabase (tabelas, RLS e Edge Functions).
4. **Validação**: Testar a responsividade e o "uau factor" inicial.

## Instruções
- **Estética Premium**: Use `backdrop-filter: blur(20px)` para modais e elementos flutuantes. Evite `border-gray-200`; use `surface-container` shifts do Material Design 3.
- **Arquitetura**: Mantenha lógica de negócios em hooks customizados ou scripts de execução para garantir que os componentes permaneçam apenas como camada visual.
- **Caminhos**: Use `/` para caminhos de arquivos.

## Recursos
- [SOP CORE](../../../directives/SOP_CORE.md)
- [Stitch MCP](mcp:StitchMCP)

---
## Aprendizados (Learnings)
- 25/04/2026: Skill inicial criada para o projeto PrintPulse 3D.
