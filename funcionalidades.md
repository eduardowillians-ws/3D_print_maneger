# PrintPulse 3D SaaS - Roteiro de Funcionalidades

Este documento rastreia o progresso do desenvolvimento do sistema **PrintPulse 3D Management**.

## Sistema Base & UI/UX (Industrial Precision)
- [x] Design System "Obsidian Dark" com Glassmorphism.
- [x] Suporte a Modo Claro/Escuro (Toggle funcional).
- [x] Navegação lateral (Sidebar) responsiva com Hamburger Menu para Mobile.
- [x] Animações fluidas com Framer Motion.
- [x] Login integrado ao Supabase com estética premium.

## Módulo: Painel (Dashboard)
- [x] Cards de KPI (Receita, Lucro, Impressões Ativas, Orçamentos).
- [x] Card adicional: Orçamentos Aprovados (com filtros de mês/ano).
- [x] Gráfico de produção diária com scroll responsivo e visual "Financial Glow".
- [x] Gráfico de Receita vs Lucro com barras duplas (receita/lucro).
- [x] Fila de Produção Ativa integrada ao centro de controle.
- [x] Alertas Críticos dinâmicos baseados no estoque mínimo.
- [x] Filtros interativos de Mês e Ano funcionais.
- [x] Destaque visual do mês selecionado no gráfico.
- [x] Gráfico de distribuição de clientes por tipo.
- [x] Total de clientes reais exibido no gráfico.
- [x] Integração real com dados do Supabase.

## Módulo: Impressoras
- [x] Monitoramento de status das máquinas.
- [x] Modal de "Vincular Nova Impressora".
- [x] Menu de Contexto (...) com ações (Calibrar, Renomear, Remover).
- [x] Botões robustos de 54px para ações críticas.
- [x] Conexão via Webhook com Klipper/Moonraker (Estrutura de Telemetria Pronta).
- [x] Card exibe horas acumuladas de trabalho (current_hours).
- [x] Detalhes exibem vida útil estimada (initial_hours) cadastrada no manual.
- [x] Campo "Horas Iniciais" no cadastro para vida útil estimada (ex: 8000h).
- [x] Cálculo de horas de produção dinâmico via jobs.

## Módulo: Materiais
- [x] Visualização de unidades AMS ativas (Slot 1 a 4).
- [x] Monitoramento de nível de material (gramagem).
- [x] Modal de "Registrar Compra" (Campos separados: Material/Fornecedor).
- [x] Adição dinâmica de itens na tabela de estoque.
- [x] Filtros por tipo de material (PLA, PETG, ABS, etc).
- [x] **NOVO: Campo "Estoque Mínimo"** no formulário de cadastro.
- [x] **NOVO: Indicador visual de nível de estoque com linha de mínimo.**
- [x] **NOVO: Status "Baixo Estoque" quando abaixo do mínimo configurado.**
- [x] **NOVO: Exibição do estoque mínimo no card do material.**

## Módulo: Catálogo de Produtos
- [x] Grid de produtos com versão e IDs.
- [x] Busca rápida por nome ou versão.
- [x] Seletor de tempo de precisão (Horas e Minutos independentes).
- [x] Calculadora de Margem de Lucro (%) com Preço Sugerido automático.
- [x] Edição de produtos existentes via modal.
- [x] Simulação de Download de arquivos STL/3MF.
- [x] Cálculo de peso de material por produto.

## Módulo: Orçamentos
- [x] Criação de orçamentos com cálculo automático (Qtd x Valor + Frete).
- [x] Status de aprovação dinâmico (Aprovar/Rejeitar).
- [x] Edição e Exclusão de orçamentos existentes.
- [x] Geração de PDF com preview funcional.
- [x] Filtros por mês/ano funcionais.

## Módulo: Produção
- [x] Quadro Kanban (Fila -> Imprimindo -> Concluido -> Arquivado).
- [x] Lançamento de novos trabalhos via modal.
- [x] Movimentação fluida entre estágios de produção.
- [x] Sistema de Arquivamento e Histórico de Produção.
- [x] Monitoramento de progresso individual por peça.
- [x] Cálculo de tempo baseado em quantidade (tempo × unidades).
- [x] Sistema de qualidade com OK/NOK baseado em 50% de eficiência.
- [x] Modal de qualidade exibe eficiência em tempo real.
- [x] Card do trabalho mostra OK (verde) ou NOK (vermelho).
- [x] Seleção de múltiplos materiais (até 4 slots AMS).
- [x] Recalculo automático de peso baseado na quantidade.
- [x] **NOVO: Alerta de estoque insuficiente na criação de jobs.**
- [x] **NOVO: Indicação visual de material com estoque baixo (vermelho).**
- [x] **NOVO: Botão desabilitado quando há alerta de estoque.**
- [x] **NOVO: Consumo automático de material ao concluir produção.**

## Módulo: Clientes (SaaS Premium)
- [x] Cadastro completo de clientes (CRM) com busca e filtros.
- [x] Histórico operacional detalhado em Drawer lateral.
- [x] **NOVO: Campo "Tipo de Cliente" (B2B, Prototipagem, Hobbyista, Educação, Outro).**
- [x] **NOVO: Distribuição de clientes por tipo no dashboard.**

## Módulo: Financeiro
- [x] Fluxo de caixa detalhado com KPI cards.
- [x] Histórico de transações com filtros (Mês/Ano/Categoria).
- [x] Menu de ações (Editar, Estornar, Excluir).
- [x] Lançamento de novas transações via modal.
- [x] Opção "Concluir" para transações pendentes.
- [x] Transições de orçamento aprovado criando transações automaticamente.

## Módulo: Relatórios (Estratégico)
- [x] Dashboard de BI com análise de performance.
- [x] Gráfico de consumo energético e custos operacionais.
- [x] Filtro por período (Mês/Ano).
- [x] **Gerador de PDF Customizado** (Relação completa de produção e financeiro).
- [x] Preview de PDF antes do download.

---

## Infraestrutura & Segurança

### Correções de Segurança (v2.2)
- [x] SECURITY DEFINER → SECURITY INVOKER em triggers SQL.
- [x] Filtros user_id em todas as operações de update/delete.
- [x] Remoção de console.log de debug em produção.
- [x] Validação e sanitização de inputs no servidor.
- [x] Headers de segurança via vercel.json.
- [x] Modal de troca de senha para usuários.

### Banco de Dados - Colunas Adicionadas
- [x] `min_stock_g` em materials (estoque mínimo em gramas).
- [x] `type` em clients (tipo de cliente).

### Migrations Criadas
- `20260513_adicionar_tipo_cliente.sql` - Adiciona coluna type na tabela clients.
- `20260513_adicionar_estoque_minimo.sql` - Adiciona coluna min_stock_g em materials.

---

## Gaps de Inteligência (A implementar)
- [ ] Manutenções: Criar `maintenance_logs` para rastrear custos de peças/serviços.
- [ ] Cruzamento Produção/CRM: Ligar `production_jobs` ao `client_id`.
- [ ] Tags de classificação recorrente para clientes (Lógica de prioridade e perfis).
- [ ] Relatório de gastos com energia e manutenção (Cálculo Automático).
- [ ] Gráfico de consumo energético e custos operacionais.

---

## Ordem de Execução Recomendada

```
Fase 1 (Infra)     → Fase 2 (Materiais)     → Fase 3 (Impressoras)
       ↓                    ↓                        ↓
Fase 4 (Clientes)  → Fase 5 (Produtos)      → Fase 6 (Orçamentos)
       ↓                    ↓                        ↓
Fase 7 (Produção)  → Fase 8 (Financeiro)    → Fase 9 (Painel)
       ↓                    
Fase 10 (BI)       
```

---

*Atualizado em: 12 de Maio de 2026*
