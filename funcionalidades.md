# 🚀 PrintPulse 3D SaaS - Roteiro de Funcionalidades

Este documento rastreia o progresso do desenvolvimento do sistema **PrintPulse 3D Management**.

## 🎨 Sistema Base & UI/UX (Industrial Precision)
- [x] Design System "Obsidian Dark" com Glassmorphism.
- [x] Suporte a Modo Claro/Escuro (Toggle funcional).
- [x] Navegação lateral (Sidebar) responsiva com Hamburger Menu para Mobile.
- [x] Animações fluidas com Framer Motion.
- [x] Login integrado ao Supabase com estética premium.

## 📊 Módulo: Painel (Dashboard)
- [x] Cards de KPI (Ganhos, Ordens, Impressoras, Materiais).
- [x] Gráfico de produção diária com scroll responsivo e visual "Financial Glow".
- [x] Fila de Produção Ativa integrada ao centro de controle.
- [x] Alertas Críticos (Estoque e Manutenção).
- [x] Filtros interativos de Mês e Ano.
- [ ] Integração real com dados do Supabase (Aguardando OK).

## 🖨️ Módulo: Impressoras
- [x] Monitoramento de status das máquinas.
- [x] Modal de "Vincular Nova Impressora".
- [x] Menu de Contexto (...) com ações (Calibrar, Renomear, Remover).
- [x] Botões robustos de 54px para ações críticas.
- [x] Conexão via Webhook com Klipper/Moonraker (Estrutura de Telemetria Pronta).

## 🧱 Módulo: Materiais
- [x] Visualização de unidades AMS ativas (Slot 1 a 4).
- [x] Monitoramento de nível de material (gramagem).
- [x] Modal de "Registrar Compra" (Campos separados: Material/Fornecedor).
- [x] Adição dinâmica de itens na tabela de estoque.
- [x] Filtros por tipo de material (PLA, PETG, ABS, etc).

## 📦 Módulo: Catálogo de Produtos
- [x] Grid de produtos com versão e IDs.
- [x] Busca rápida por nome ou versão.
- [x] Seletor de tempo de precisão (Horas e Minutos independentes).
- [x] Calculadora de Margem de Lucro (%) com Preço Sugerido automático.
- [x] Edição de produtos existentes via modal.
- [x] Simulação de Download de arquivos STL/3MF.

## 📑 Módulo: Orçamentos
- [x] Criação de orçamentos com cálculo automático (Qtd x Valor + Frete).
- [x] Status de aprovação dinâmico (Aprovar/Rejeitar).
- [x] Edição e Exclusão de orçamentos existentes.
- [ ] Gerador de orçamentos PDF real (download).

## ⚙️ Módulo: Produção
- [x] Quadro Kanban (Fila -> Imprimindo -> Concluido).
- [x] Lançamento de novos trabalhos via modal.
- [x] Movimentação fluida entre estágios de produção.
- [x] Sistema de Arquivamento e Histórico de Produção.
- [x] Monitoramento de progresso individual por peça.

## 👥 Módulo: Clientes (SaaS Premium)
- [x] Cadastro completo de clientes (CRM) com busca e filtros.
- [x] Histórico operacional detalhado em Drawer lateral.
- [ ] Tags de classificação recorrente (Lógica de prioridade e perfis).

## 💰 Módulo: Financeiro
- [x] Fluxo de caixa detalhado com KPI cards.
- [x] Histórico de transações com filtros (Mês/Ano/Categoria).
- [x] Menu de ações (Editar, Estornar, Excluir).
- [x] Lançamento de novas transações via modal.
- [ ] Relatório de gastos com energia e manutenção (Cálculo Automático).

## 📊 Módulo: Relatórios (Estratégico)
- [ ] Dashboard de BI com análise de performance.
- [ ] Gráfico de consumo energético e custos operacionais.
- [ ] Filtro por período (Mês/Ano).
- [ ] **Gerador de PDF Customizado** (Relação completa de produção e financeiro).

## 🛠️ Infraestrutura & Persistência (Back-end)
- [x] Conexão remota vinculada ao projeto `noxbszwzxpvwjmnlghhw`.
- [x] Estrutura completa de tabelas (SQL) executada com sucesso.
- [x] Persistência local do esquema em `supabase/schema.sql` para futuras AIs.
- [x] Mobile Refresh: Menu Drawer responsivo com fechamento automático.

---

## 🏗️ Diagnóstico de Dados & Integração (Supabase)
### ✅ Estrutura Atual (Ok)
- **Gestão de Máquinas**: Tabela `printers` com telemetria básica e status.
- **Financeiro**: Tabela `transactions` pronta para fluxo de caixa real.
- **CRM**: Tabela `clients` com suporte a tags e contatos.

### ⚠️ Gaps de Inteligência (A implementar)
- **Manutenções**: Criar `maintenance_logs` para rastrear custos de peças/serviços.
- **Cruzamento Produção/CRM**: Ligar `production_jobs` ao `client_id`.
- **Rastreabilidade de Insumos**: Ligar `production_jobs` ao `product_id` e `material_id`.

---

## 🔄 Plano de Migração: Dados Mockados → Supabase

### Visão Geral
Este plano documenta a transição progressiva dos dados mockados (gerados inline nas views) para dados reais do banco Supabase, mantendo a estabilidade do sistema em cada etapa.

### Tabelas do Supabase
| Tabela | Descrição |
|--------|-----------|
| `printers` | Impressoras 3D |
| `materials` | Materiais (filamentos) |
| `products` | Catálogo de produtos |
| `clients` | Clientes (CRM) |
| `quotes` | Orçamentos |
| `production_jobs` | Jobs de produção |
| `transactions` | Transações financeiras |

---

### Fase 1: Infraestrutura Base (CRUD Genérico) ✅ CONCLUÍDO
**Objetivo**: Criar camada de acesso a dados reutilizável.

- [x] **1.1** - Criar pasta `src/services/api/` para serviços de API.
- [x] **1.2** - Criar arquivo `src/services/api/baseQueries.ts` com wrapper para Supabase.
- [x] **1.3** - Implementar funções genéricas: `getAll`, `getById`, `create`, `update`, `delete`.
- [x] **1.4** - Criar tipos TypeScript para cada tabela em `src/types/database.ts`.
- [x] **1.5** - Adicionar tratamento de erros e loading states.

**Arquivos criados:**
- `src/services/api/baseQueries.ts` - Wrapper CRUD genérico
- `src/types/database.ts` - Tipos TypeScript para todas as tabelas
- `src/services/api/materials.ts` - Exemplo de serviço específico

**Critério de aceite**: ✅ Build passou com sucesso.

---

### Fase 2: Módulo Materiais (Simples) ✅ CONCLUÍDO
**Objetivo**: Substituir dados mockados de materiais.

**Mock atual**: Dados inline em `MateriaisView.tsx` (gerados aleatoriamente).

**Etapas:**
- [x] **2.1** - Criar `src/services/api/materials.ts` com funções específicas.
- [x] **2.2** - Modificar `MateriaisView.tsx` para usar dados da API.
- [x] **2.3** - Implementar operações de create/update/delete no modal de registro.
- [x] **2.4** - Testar filtros (PLA, PETG, ABS, etc).

**Implementação:**
- Dados reais do Supabase (tabela `materials`)
- Loading state com spinner
- Mapeamento de dados do banco para UI
- CRUD completo via API
- Busca/filtro por nome e fornecedor

**Riscos**: Baixo - módulo isolado, sem dependências externas.
**Estratégia de rollback**: Manter dados mock em variável local durante transição.

---

### Fase 3: Módulo Impressoras ✅ CONCLUÍDO
**Objetivo**: Integrar monitoramento de impressoras com dados reais.

**Mock atual**: Status simulado em `ImpressorasView.tsx`.

**Etapas:**
- [x] **3.1** - Criar `src/services/api/printers.ts`.
- [x] **3.2** - Conectar `ImpressorasView.tsx` à API.
- [x] **3.3** - Implementar ações (Calibrar, Renomear, Remover).
- [x] **3.4** - Adicionar modal de "Vincular Nova Impressora" com POST.

**Implementação:**
- Dados reais do Supabase (tabela `printers`)
- Loading state com spinner
- CRUD completo (create, update, rename, delete)
- Mapeamento de status: OCIOSA, IMPRIMINDO, MANUTENÇÃO

**Riscos**: Médio - integração com telemetria requer validação de dados.
**Estratégia de rollback**: Interface continua mostrando último dado válido.

---

### Fase 4: Módulo Clientes (CRM) ✅ CONCLUÍDO
**Objetivo**: Substituir dados mockados de clientes.

**Mock atual**: Lista fixa de clientes em `ClientsView.tsx`.

**Etapas:**
- [x] **4.1** - Criar `src/services/api/clients.ts`.
- [x] **4.2** - Modificar `ClientsView.tsx` para consumir API.
- [x] **4.3** - Implementar busca e filtros.
- [ ] **4.4** - Conectar Drawer de histórico ao `client_id`.
- [ ] **4.5** - Adicionar sistema de Tags (classificação).

**Implementação:**
- Dados reais do Supabase (tabela `clients`)
- CRUD completo (create, update, delete)
- Loading state com spinner
- Busca por nome, email, telefone

**Riscos**: Médio - dependência com orçamentos e produção (futuro).
**Estratégia de rollback**: Cache local dos dados anteriores.

---

### Fase 5: Módulo Produtos (Catálogo) ✅ CONCLUÍDO
**Objetivo**: Migrar catálogo de produtos.

**Mock atual**: Grid de produtos em `ProdutosView.tsx`.

**Etapas:**
- [x] **5.1** - Criar `src/services/api/products.ts`.
- [x] **5.2** - Conectar `ProdutosView.tsx`.
- [x] **5.3** - Manter lógica de calculadora de margem (dados locais).
- [x] **5.4** - Implementar edição completa via modal.
- [x] **5.5** - Adicionar busca rápida por nome/versão.

**Implementação:**
- Dados reais do Supabase (tabela `products`)
- CRUD completo (create, update, delete)
- Loading state com spinner
- Calculadora de margem mantida (dados locais)
- Busca por nome e versão

**Riscos**: Baixo - tabela independentes, sem dependências críticas.
**Estratégia de rollback**: Manter versão offline do catálogo.

---

### Fase 6: Módulo Orçamentos
**Objetivo**: Integrar gestão de orçamentos com dados reais.

**Mock atual**: Lista de orçamentos em `OrcamentosView.tsx` / `EstimatesView.tsx`.

**Etapas:**
- [ ] **6.1** - Criar `src/services/api/quotes.ts`.
- [ ] **6.2** - Modificar views de orçamentos.
- [ ] **6.3** - Conectar `client_id` na criação de orçamentos.
- [ ] **6.4** - Implementar status dinâmico (Aprovar/Rejeitar).
- [ ] **6.5** - Adicionar geração de PDF (pendente do roadmap).

**Riscos**: Médio - depende de `clients` (Fase 4).
**Estratégia de rollback**: Lista de orçamentos em memória.

---

### Fase 7: Módulo Produção (Kanban)
**Objetivo**: Migrar quadro Kanban para dados reais.

**Mock atual**: Dados gerados em `ProducaoView.tsx`.

**Etapas:**
- [ ] **7.1** - Criar `src/services/api/production.ts`.
- [ ] **7.2** - Conectar `ProducaoView.tsx` ao Kanban.
- [ ] **7.3** - Implementar arrastar entre colunas (status update).
- [ ] **7.4** - Adicionar link com `printer_id` (impressora atribuída).
- [ ] **7.5** - Implementar arquivamento e histórico.

**Riscos**: Alto - múltiplas dependências (printers, products, clients).
**Estratégia de rollback**: Sincronização manual temporária.

---

### Fase 8: Módulo Financeiro
**Objetivo**: Integrar fluxo de caixa com dados reais.

**Mock atual**: Transações simuladas em `FinancialView.tsx`.

**Etapas:**
- [ ] **8.1** - Criar `src/services/api/transactions.ts`.
- [ ] **8.2** - Modificar `FinancialView.tsx` para consumir API.
- [ ] **8.3** - Implementar filtros (Mês/Ano/Categoria).
- [ ] **8.4** - Adicionar operações (Editar, Estornar, Excluir).
- [ ] **8.5** - Calcular KPIs automaticamente via query agregada.

**Riscos**: Baixo - tabela independente, sem dependências.
**Estratégia de rollback**: Histórico de transações em cache local.

---

### Fase 9: Módulo Painel (Dashboard)
**Objetivo**: Consolidar dados de todas as APIs para o dashboard.

**Mock atual**: Dados gerados matematicamente em `PainelView.tsx`.

**Etapas:**
- [ ] **9.1** - Criar `src/services/api/dashboard.ts`.
- [ ] **9.2** - Implementar queries agregadas (receita, lucro, impressões).
- [ ] **9.3** - Conectar gráfico de produção diária.
- [ ] **9.4** - Popular fila de produção ativa.
- [ ] **9.5** - Adicionar alertas críticos (estoque, manutenção).

**Riscos**: Alto - depende de todas as fases anteriores.
**Estratégia de rollback**: Fallback para dados calculados localmente.

---

### Fase 10: Relatórios (BI)
**Objetivo**: Gerar relatórios consolidados.

**Mock atual**: View vazia em `ReportsView.tsx`.

**Etapas:**
- [ ] **10.1** - Criar PostgreSQL Views para agregações.
- [ ] **10.2** - Implementar dashboard de BI.
- [ ] **10.3** - Adicionar gráficos de consumo energético.
- [ ] **10.4** - Gerador de PDF customizado.

**Riscos**: Médio - requires understanding de queries complexas.
**Estratégia de rollback**: Relatórios em formato texto simples.

---

### Ordem de Execução Recomendada

```
Fase 1 (Infra)     → Fase 2 (Materiais)     → Fase 3 (Impressoras)
       ↓                    ↓                        ↓
Fase 4 (Clientes)  → Fase 5 (Produtos)      → Fase 6 (Orçamentos)
       ↓                    ↓                        ↓
Fase 7 (Produção)  → Fase 8 (Financeiro)    → Fase 9 (Painel)
       ↓                    
Fase 10 (BI)       
```

### Regras de Ouro
1. **Nunca fazer break de funcionalidade existente** - desenvolver paralelo.
2. **Commits atômicos** - cada fase = 1 commit específico no git.
3. **Testar manualmente após cada fase** - validar dado real aparece na UI.
4. **Documentar mudanças** - atualizar este arquivo após cada fase.
5. **Fallback ready** - sempre ter plano B para dado não disponível.

### Comandos Úteis
```bash
# Verificar dados no Supabase (via Dashboard)
# https://supabase.com/dashboard/project/noxbszwzxpvwjmnlghhw

# Testar API local (depois de implementar)
npm run dev
```

---

*Atualizado em: 27 de Abril de 2026*
