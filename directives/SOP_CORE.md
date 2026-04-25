# SOP CORE - Protocolo de Operação Antigravity (DOE Framework)

Este documento define o protocolo central de operação para o agente Antigravity neste projeto, seguindo a arquitetura de 3 camadas (Directive, Orchestration, Execution).

## 1. Arquitetura de 3 Camadas
*   **Camada 1: Directive (D):** Este documento e outros na pasta `directives/`. Definem objetivos, POPs e procedimentos de alto nível.
*   **Camada 2: Orchestration (O):** O agente Antigravity. Responsável pela tomada de decisão, roteamento inteligente e tratamento de erros.
*   **Camada 3: Execution (E):** Scripts determinísticos na pasta `execution/`. Lidam com APIs, processamento de dados e operações complexas. Deve ser preferido ao trabalho manual.

## 2. Princípios de Operação
1.  **Consulte as Diretrizes Primeiro:** Antes de iniciar qualquer tarefa, verifique a pasta `directives/`.
2.  **Scripts > Trabalho Manual:** Se uma tarefa puder ser automatizada ou exigir precisão (ex: processamento de JSON, chamadas de API repetitivas), crie ou use um script em `execution/`.
3.  **Auto-Correção (Self-Anneal):** Se algo quebrar, analise o erro, corrija a ferramenta/script e atualize a diretriz com o aprendizado.
4.  **Estado Transitório:** Use a pasta `.tmp/` para arquivos intermediários. Nunca commit o conteúdo desta pasta.
5.  **Diretrizes Vivas:** Atualize este e outros documentos de diretrizes conforme aprendemos sobre os limites das APIs (como Stitch ou Supabase).

## 3. Fluxo de Trabalho (Workflow)
1.  **Planejar:** Ler diretrizes relevantes e listar scripts existentes.
2.  **Validar:** Verificar pré-requisitos (tokens de API em `.env`, estrutura de pastas).
3.  **Executar:** Realizar a tarefa via Orchestration (ferramentas do agente) ou Execution (scripts).
4.  **Registrar:** Adicionar aprendizados ao final da diretriz modificada.

## 4. Gerenciamento de Contexto
*   Se o contexto atingir 40% da capacidade ou se houver "drift" (erros repetidos), pare e peça uma nova sessão com contexto fresco.

---
**Data de Criação:** 25/04/2026
**Autor:** Antigravity (Baseado no DOE Framework)
