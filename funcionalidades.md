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
- [x] Gráfico de evolução mensal (Mock) e Distribuição de Clientes.
- [x] Fila de Produção Ativa integrada ao centro de controle.
- [x] Alertas Críticos (Estoque e Manutenção).
- [x] Filtros interativos de Mês e Ano.
- [ ] Integração real com dados do Supabase.

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

## 👥 Módulo: Clientes (Próximo Passo)
- [ ] Cadastro completo de clientes (CRM).
- [ ] Histórico de pedidos por cliente.
- [ ] Tags de classificação (Recorrente, VIP, etc).

## 💰 Módulo: Financeiro
- [x] Fluxo de caixa detalhado com KPI cards.
- [x] Histórico de transações com filtros (Mês/Ano/Categoria).
- [x] Menu de ações (Editar, Estornar, Excluir).
- [x] Lançamento de novas transações via modal.
- [ ] Relatório de gastos com energia e manutenção (Cálculo Automático).

---
*Atualizado em: 25 de Abril de 2026*
