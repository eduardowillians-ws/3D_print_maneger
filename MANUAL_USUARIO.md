# PrintPulse 3D

## Sistema de Gestão para Lojas de Impressão 3D

### Manual do Usuário

**Versão 1.0**
**Atualizado em Junho de 2026**

---

## O que o PrintPulse 3D faz?

O PrintPulse 3D é um sistema completo de gestão para lojas de impressão 3D. Com ele, você tem:

- **Controle de Produção** — Gerencie máquinas, materiais e pedidos de impressão
- **Controle de Estoque** — Gerencie filamentos, resinas e insumos com controle automático
- **Controle Financeiro** — Registre receitas, despesas e acompanhe o lucro
- **Gestão de Clientes** — Cadastro completo com histórico de compras e orçamentos
- **Orçamentos Profissionais** — Crie orçamentos com múltiplos itens e envio via WhatsApp
- **Loja Virtual** — Catálogo online de produtos para receber pedidos pela internet
- **Relatórios Gerenciais** — Gráficos, KPIs e exportação em PDF
- **Gestão de Impressoras** — Controle de máquinas, status e manutenção
- **Gestão de Materiais** — Controle de filamentos, resinas e propriedades técnicas

---

## 1. ACESSO AO SISTEMA

### Primeiro Login

1. Acesse o site do sistema
2. Insira seu **e-mail** e **senha**
3. Clique em **"Entrar"**
4. O sistema irá direcionar para o **Dashboard**

### Requisitos Mínimos

| Requisito | Detalhe |
|-----------|---------|
| Internet | Conexão ativa (broadband ou 4G) |
| Navegador | Google Chrome (recomendado), Microsoft Edge, Safari ou Firefox |
| Resolução | Mínima: 1366x768 |

---

## 2. PRIMEIROS PASSOS

### Configuração Inicial

**PASSO 1: Configurar Empresa (5 min)**
├── Nome da loja
├── Logo
├── Moeda padrão
└── Tema (escuro/claro)

**PASSO 2: Cadastrar Materiais (10 min)**
├── Filamentos (PLA, ABS, PETG, TPU)
├── Resinas
├── Propriedades (cor, peso, preço)
└── Estoque atual

**PASSO 3: Cadastrar Impressoras (5 min)**
├── Nome e modelo
├── Tipo (FDM, SLA)
├── Status (ociosa, impressão, manutenção)
└── Dimensões da área de impressão

**PASSO 4: Cadastrar Produtos (10 min)**
├── Nome e descrição
├── Preço de venda
├── Materiais utilizados
└── Imagens

**PASSO 5: Configurar Loja Virtual (5 min)**
├── Nome da loja
├── Descrição
├── Link único
├── Imagem de capa
└── Redes sociais

**PASSO 6: Receber Pedidos! (instantâneo)**
├── Loja virtual funciona 24h
├── Pedidos chegam no painel de produção
└── Materiais descontam automaticamente

### Tempo Médio de Implantação

| Etapa | Tempo |
|-------|-------|
| Configuração da empresa | 5 min |
| Cadastro de materiais | 10 min |
| Cadastro de impressoras | 5 min |
| Cadastro de produtos | 10 min |
| Configuração da loja virtual | 5 min |
| Teste de pedido | 5 min |
| **TOTAL** | **30 a 60 min** |

> **DICA:** Comece cadastrando os 5 produtos mais vendidos. Depois vá adicionando o resto.

---

## 3. NAVEGAÇÃO PRINCIPAL

O sistema tem uma **barra lateral esquerda** com todas as seções:

| Ícone | Seção | Função |
|-------|-------|--------|
| Casa | Dashboard | Visão geral com gráficos e KPIs |
| Impressora 3D | Impressoras | Controle de máquinas |
| Rolo | Materiais | Controle de filamentos e resinas |
| Caixa | Produtos | Catálogo de produtos |
| Usuários | Clientes | Cadastro de clientes |
| Documento | Orçamentos | Criação e envio de orçamentos |
| Engrenagem | Produção | Acompanhamento de impressões |
| Gráfico | Financeiro | Lançamentos de caixa |
| Loja | Loja Virtual | Configuração do catálogo online |
| Config | Configurações | Dados da empresa |

---

## 4. DASHBOARD

### O que Tem no Painel

**Cards KPI:**
- **Receita Total** — Faturamento do período com comparação ao mês anterior
- **Lucro Mensal** — Lucro líquido com comparação ao mês anterior
- **Impressões Ativas** — Quantidade de impressões em andamento com taxa de utilização
- **Orçamentos Pendentes** — Quantidade de orçamentos aguardando resposta
- **Orçamentos Aprovados** — Quantidade de orçamentos aprovados no período

**Gráficos:**
- **Receita vs Lucro** — Barras mensais para o ano selecionado
- **Distribuição de Clientes** — Donut com categorias: B2B, Prototipagem, Hobbyistas, Educação
- **Volume de Produção Diário** — Barras com produção diária do mês selecionado

**Alertas Críticos:**
- Materiais com estoque baixo
- Impressoras em manutenção
- Pedidos parados há muito tempo

---

## 5. CONFIGURAÇÕES INICIAIS

### Cadastro de Materiais

1. Va em **Materiais** na barra lateral
2. Clique em **"+ Novo Material"**
3. Preencha:
   - **Nome:** Ex: "Filamento PLA 1.75mm"
   - **Tipo:** PLA, PETG, ABS, TPU ou Resina (detectado automaticamente pelo nome)
   - **Cor:** Selecione a cor
   - **Fornecedor:** Marca/fabricante
   - **Peso (g):** Peso da bobina/unidade
   - **Preço por kg:** Valor de compra
   - **Estoque atual:** Quantidade em estoque (em gramas)
   - **Estoque mínimo:** Limite para alerta (em gramas)
   - **Espessura:** Diâmetro do filamento (ex: 1.75mm)
   - **Temperatura de extrusão:** Faixa inferior e superior (°C)
   - **Temperatura da mesa:** Faixa inferior e superior (°C)
4. Clique em **"Salvar"**

> **IMPORTANTE:** O peso do material é usado para calcular o custo de produção dos produtos automaticamente.

### Cadastro de Impressoras

1. Va em **Impressoras** na barra lateral
2. Clique em **"+ Nova Impressora"**
3. Preencha:
   - **Nome:** Ex: "Bambu Lab X1C"
   - **Status:** Ociosa, Em Impressão ou Em Manutenção
   - **Volume de impressão:** Dimensões máximas (ex: 256x256x256mm)
   - **Temperatura do Hotend:** Alvo em °C
   - **Temperatura da Mesa:** Alvo em °C
   - **Velocidade do Ventilador:** Percentual alvo
   - **Horas iniciais:** Horas de uso antes do início do rastreamento
4. Clique em **"Salvar"**

### Cadastro de Produtos

1. Va em **Produtos** na barra lateral
2. Clique em **"+ Novo Produto"**
3. Preencha:
   - **Nome:** Ex: "Suporte para Celular"
   - **Descrição:** Descrição do produto
   - **Preço de venda:** Valor em R$
   - **Categoria:** Personalizados, Peças Padrão, Acessórios
   - **Tempo estimado (horas):** Tempo de impressão
   - **Materiais:** Selecione os materiais utilizados e a quantidade por unidade
   - **Imagem:** Upload de foto (comprimida automaticamente)
4. Clique em **"Salvar"**

> **IMPORTANTE:** Ao cadastrar os materiais do produto, o sistema calcula automaticamente o custo de produção. Você não precisa digitar o custo manualmente.

### Configurações da Empresa

1. Va em **Configurações**
2. Aqui voce pode alterar:
   - **Nome e sobrenome** do usuário
   - **E-mail** de acesso
   - **Foto de perfil** (com upload e compressão automática)
   - **Tema:** Escuro ou Claro
   - **Sistema de medida:** Métrico (mm, kg, °C) ou Imperial (in, lbs, °F)
   - **Moeda:** BRL (R$), USD ($) ou EUR (€)
   - **Trocar senha** de acesso
3. Clique em **"Salvar Alterações"**

---

## 6. GESTÃO DE MATERIAIS

### Tipos de Material Suportados

| Tipo | Descrição | Uso Comum |
|------|-----------|-----------|
| **PLA** | Ácido Polilático. Biodegradável, fácil de imprimir. | Protótipos, peças decorativas, brindes |
| **PETG** | Tereftalato de Polietileno. Resistente e flexível. | Peças funcionais, peças que precisam de resistência |
| **ABS** | Acrilonitrila Butadieno Estireno. Resistente ao calor. | Peças mecânicas, peças que precisam de calor |
| **TPU** | Poliuretano Termoplástico. Elástico e flexível. | Capinhas, peças flexíveis, vedações |
| **Resina** | Material líquido curado por luz UV. Alta precisão. | Joias, dentística, miniaturas detalhadas |

### Status do Estoque

| Status | Significado |
|--------|-------------|
| Em Estoque | Quantidade acima do mínimo |
| Baixo Estoque | Quantidade igual ou abaixo do mínimo |
| Esgotado | Quantidade zero |

### Propriedades Técnicas Cada Material

Cada material armazena:
- **Temperatura de extrusão** (faixa inferior e superior em °C)
- **Temperatura da mesa** (faixa inferior e superior em °C)
- **Espessura** do filamento (ex: 1.75mm)
- **Fornecedor** (marca/fabricante)

### Alterar Quantidade

- **Botão seta pra cima:** Adiciona 1 unidade
- **Botão seta pra baixo:** Remove 1 unidade
- **Duplo clique na quantidade:** Digite o valor exato e clique no check verde

### Editar ou Excluir Material

- Clique no **botão de lápis** para editar o material
- Clique no **botão de lixeira** para excluir

---

## 7. GESTÃO DE IMPRESSORAS

### Status das Impressoras

| Status | Significado | Cor |
|--------|-------------|-----|
| Ociosa | Disponível para nova produção | Cinza |
| Em Impressão | Está produzindo uma peça | Verde |
| Em Manutenção | Temporariamente indisponível | Vermelho |

### Informações da Impressora

Cada impressora armazena:
- **Nome** — Identificação da máquina
- **Volume de impressão** — Dimensões máximas (ex: 256x256x256mm)
- **Temperatura do Hotend** — Temperatura alvo do bico
- **Temperatura da Mesa** — Temperatura alvo da mesa
- **Velocidade do Ventilador** — Percentual alvo
- **Horas de uso** — Acumulado de horas de impressão
- **Última calibração** — Data da última calibração
- **Última manutenção** — Data da última manutenção
- **Total de produções** — Quantidade de trabalhos realizados
- **Total de peças** — Quantidade de peças produzidas
- **Tempo médio por peça** — Média de tempo de impressão

### Telemetria da Impressora

Ao clicar em uma impressora, voce visualiza:
- Temperatura atual vs alvo (Hotend e Mesa)
- Ventilador atual vs alvo
- Vida útil estimada
- Última manutenção
- Produções realizadas
- Peças produzidas
- Tempo médio por peça

### KPIs de Impressoras

- **Frota Total** — Total de impressoras cadastradas
- **Impressão Ativa** — Impressoras em uso
- **Ociosas / Prontas** — Impressoras disponíveis
- **Manutenção** — Impressoras em manutenção

### Calibrar Impressora

1. Clique na impressora desejada
2. Clique em **"Calibrar"**
3. A data de última calibração é atualizada automaticamente

---

## 8. SISTEMA DE ORÇAMENTOS

### Criar um Orçamento

1. Va em **Orcamentos** na barra lateral
2. Clique em **"+ Novo Orcamento"**
3. Preencha:
   - **Cliente:** Selecione o cliente (ou cadastre novo)
   - **Data de validade:** Data limite para aprovação
   - **Observações:** Detalhes adicionais
4. **Adicione Produtos:**
   - Selecione o produto do catálogo
   - Informe a descrição (personalização)
   - Informe a quantidade
   - O preço unitário é preenchido automaticamente
   - Adicione até múltiplos itens
5. Adicione **frete** (se necessário)
6. Clique em **"Salvar"**

### Status do Orçamento

| Status | Significado |
|--------|-------------|
| Pendente | Aguardando resposta do cliente |
| Enviado | Orçamento enviado ao cliente |
| Aprovado | Cliente aprovou, pode gerar produção |
| Rejeitado | Cliente rejeitou o orçamento |
| Arquivado | Orçamento arquivado |

### Aprovar Orçamento

Ao aprovar um orçamento:
1. Clique no botão **"Aprovar"**
2. Confirme a ação
3. O sistema cria automaticamente um lançamento de **receita** no Financeiro
4. O orçamento fica com status "Aprovado"

### Enviar via WhatsApp

1. Abra o orçamento criado
2. Clique no botão **"WhatsApp"**
3. O sistema gera uma mensagem formatada com:
   - Lista de produtos
   - Quantidades e preços
   - Valor total
   - Dados do cliente
4. A mensagem é enviada diretamente para o WhatsApp

### Visualizar PDF

1. Abra o orçamento
2. Clique em **"Visualizar PDF"**
3. Veja o documento formatado
4. Imprima ou salve como PDF

---

## 9. GESTÃO DE CLIENTES

### Cadastro de Clientes

1. Va em **Clientes**
2. Clique em **"+ Cadastrar Cliente"**
3. Preencha:
   - **Nome Completo**
   - **Telefone:** Com DDD (obrigatório)
   - **E-mail:** (opcional)
   - **Endereço:** Rua, Numero e Cidade (opcional)
   - **Tipo:** Selecione uma tag (B2B, Prototipagem, Hobbyista, Educação, etc.)
4. Clique em **"Cadastrar Cliente"**

> **IMPORTANTE:** O telefone é obrigatório para identificar o cliente. O e-mail é opcional.

### Auto-cadastro via Loja Virtual

Quando um cliente faz pedido pela loja virtual:
1. O sistema verifica se o cliente já existe pelo telefone
2. Se não existir, cria o cadastro automaticamente
3. O cliente é cadastrado com tipo "Loja Virtual"

### Editar ou Excluir Cliente

- Clique no **botão de lápis** para editar
- Clique no **botão de lixeira** para excluir

---

## 10. CONTROLE DE PRODUÇÃO

### Painel de Produção (Kanban)

Os pedidos de impressão aparecem em colunas como um quadro Kanban:

| Coluna | Significado | Ícone |
|--------|-------------|-------|
| Na Fila | Pedido aguardando iniciar | Relógio |
| Em Produção | Impressora está produzindo | Play |
| Finalizado | Impressão concluída | CheckCircle |
| Arquivado | Histórico de produções | Arquivo |

### Mover Pedido no Kanban

Para mover um pedido, basta clicar no **botão da seta** do card:

- **Na Fila → Em Produção**
- **Em Produção → Finalizado**
- **Finalizado → Arquivado**

### O que Acontece ao Finalizar

Ao marcar como **Finalizado**, o sistema:
- ✅ Atualiza os totais da impressora (peças, horas)
- ✅ Registra os materiais utilizados
- ✅ Calcula eficiência da produção

### Parâmetros de Produção

Cada trabalho de produção registra:
- **Temperatura do Hotend** alvo
- **Temperatura da Mesa** alvo
- **Velocidade do Ventilador** alvo
- **Materiais utilizados** (até 4 slots com peso por unidade)

### Controle de Qualidade

Ao finalizar uma produção, voce pode registrar:
- **Quantidade de peças boas**
- **Quantidade de peças com defeito**
- **Notas de qualidade**
- **Eficiência** (calculada automaticamente)

### Cancelar Produção

- Clique no **botão "Cancelar"** no card do pedido
- O pedido muda para status **"Arquivado"**
- Os materiais são devolvidos automaticamente ao estoque

### Código da Produção

Cada trabalho de produção recebe um **código único** (ID do sistema), como **#a1b2c3d4**.

O código é utilizado para:
- Identificação rápida no painel
- Localização facilitada
- Comunicação com o cliente

---

## 11. CONTROLE FINANCEIRO

### Lançar uma Transação

1. Va em **Financeiro**
2. Clique em **"+ Lançar Caixa"**
3. Preencha:
   - **Tipo:** Receita (Entrada) ou Despesa (Saída)
   - **Valor:** Valor em R$
   - **Descrição:** Ex: "Venda suporte personalizado"
   - **Categoria:** Vendas, Insumos, Serviços, Manutenção, Outros
   - **Data:** Data do lançamento
4. Clique em **"Lançar Transação"**

### Status da Transação

| Status | Significado |
|--------|-------------|
| PENDENTE | Pagamento aguardando confirmação |
| CONCLUIDO | Pagamento confirmado e processado |
| ESTORNADO | Pagamento devolvido/cancelado |

### Gerenciar Status

- **Concluir:** Muda de PENDENTE para CONCLUIDO
- **Estornar:** Muda de CONCLUIDO para ESTORNADO

### Categorias Disponíveis

**Para cadastro:** Vendas, Insumos, Serviços, Manutenção, Outros

**Para filtro:** Todas, Vendas, Insumos, Serviços, Manutenção, Energia, Aluguel

### Transações Automáticas

O sistema cria receitas automaticamente quando:
- **Orçamento aprovado:** Receita = valor do orçamento

### KPIs Financeiros

- **Receita Total** — Soma de todas as receitas com comparação ao mês anterior
- **Custos Totais** — Soma de todas as despesas com comparação ao mês anterior
- **Lucro Líquido** — Receita menos Custos com comparação ao mês anterior
- **Ticket Médio** — Valor médio por transação

### Gráfico Financeiro

- **Barras Mensais** — Receitas vs Custos para todos os meses do ano selecionado

### Editar ou Excluir Lançamento

- Clique no **botão de lápis** para editar um lançamento
- Clique no **botão de lixeira** para excluir

---

## 12. LOJA VIRTUAL (CATÁLOGO ONLINE)

### Benefícios da Loja Virtual

| Benefício | Descrição |
|-----------|-----------|
| Sem comissão | Diferente do Mercado Livre, não há taxa por pedido |
| Recebimento pela internet | Sua loja recebe pedidos pelo catálogo online |
| Identidade visual | Sua loja com sua logo, suas cores, seu estilo |
| Dados dos clientes | Você sabe quem compra e com que frequência |
| WhatsApp integrado | Pedidos enviados direto para seu WhatsApp |

### Link da Loja Virtual

Cada loja tem um link único, como:
```
https://seu-dominio.com/loja/{seu-id}
```

> **DICA:** Coloque o link da loja nas redes sociais, cartões de visita e WhatsApp da loja.

### Configurar a Loja Virtual

1. Va em **Minha Loja** na barra lateral
2. Configure:
   - **Nome da Loja**
   - **Descrição**
   - **WhatsApp** (com código do país)
   - **Imagem de Capa**
   - **Texto Institucional** (Sobre Nós)
   - **Redes Sociais:** Facebook, Instagram, TikTok, YouTube, LinkedIn, Pinterest, E-mail
3. Cadastre os **Produtos da Loja** com preços e imagens
4. O link da loja é gerado automaticamente
5. Clique em **"Copiar Link"** para compartilhar

### O que o Cliente Vê

```
┌─────────────────────────────────────────────────────────────┐
│ 🖨️ PRINTPULSE 3D - Sua Loja de Impressão 3D               │
│ 📍 Rua das Flores, 123 - São Paulo                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ BEM-VINDO À NOSSA LOJA                                      │
│ Peças personalizadas e fabricação sob demanda               │
│                                                             │
│ [Ver Produtos]                    [Carrinho]                │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ CATEGORIAS: [Personalizados] [Peças Padrão] [Acessórios]   │
│                                                             │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│ │ 📦 │ │ 📦 │ │ 📦 │           │
│ │ Suporte │ │ Encaixe │ │ Adaptador │           │
│ │ Celular │ │ Universal │ │ USB-C │           │
│ │ R$ 25,00 │ │ R$ 15,00 │ │ R$ 35,00 │           │
│ │ Estoque: 10│ │ Estoque: 25│ │ Estoque: 8 │           │
│ │ [Adicionar]│ │ [Adicionar]│ │ [Adicionar]│           │
│ └─────────────┘ └─────────────┘ └─────────────┘           │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ 💳 PIX, Cartão, Dinheiro                                   │
│ 🚚 Retirada ou Entrega                                     │
└─────────────────────────────────────────────────────────────┘
```

### Como o Cliente Faz um Pedido

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│ 1. ESCOLHE       │ --> │ 2. PREENCHE      │ --> │ 3. CONFIRMA      │
│ PRODUTO          │     │ DADOS            │     │ PEDIDO           │
│                  │     │                  │     │                  │
│ • Quantidade     │     │ • Nome           │     • Envia para      │
│ • Adiciona       │     │ • Telefone       │       WhatsApp       │
│   ao carrinho    │     │ • Endereço       │     • Pedido criado   │
└──────────────────┘     └──────────────────┘     └──────────────────┘
```

### Estoque na Loja Virtual

O estoque é exibido automaticamente para o cliente:

| Estoque | Exibição |
|---------|----------|
| Alto (>10) | "Estoque: 15 un" (verde) |
| Baixo (1-10) | "Últimas 3 un" (amarelo) |
| Sem estoque (0) | "Sem estoque no momento" (vermelho) |

> **IMPORTANTE:** Quando o estoque chega a zero, o produto fica automaticamente indisponível na loja virtual.

---

## 13. SISTEMA DE WHATSAPP

### Integração com WhatsApp

Ao criar um orçamento, o sistema pode enviar diretamente para o WhatsApp:

1. O sistema gera uma mensagem formatada
2. Inclui: lista de produtos, quantidades, preços, valor total
3. Dados do cliente
4. Link para confirmação

### Formato da Mensagem

```
🛒 Pedido - Minha Loja 3D

• Suporte Celular (x2) - R$ 50,00
• Encaixe Universal (x1) - R$ 15,00

💰 Total: R$ 65,00

👤 Cliente: João Silva
📞 Tel: (11) 99999-9999

Aguardo confirmação!
```

---

## 14. RELATÓRIOS E EXPORTAÇÃO

### Relatório Geral

1. Va em **Relatórios**
2. Visualize as seguintes seções:

**KPIs:**
- **Receita Total** — Faturamento do período
- **Lucro Mensal** — Lucro líquido
- **Peças Produzidas** — Quantidade total de peças
- **Horas de Impressão** — Total de horas de máquina

**Rankings:**
- **TOP 5 Clientes** — Clientes que mais compraram (por valor)
- **TOP 5 Produtos** — Produtos mais vendidos (por quantidade)

**Análise de Materiais:**
- **Mix de Materiais** — Gráfico de barras com percentual de uso de cada material, quantidade em kg

### Filtros

- **Mês e Ano** — Selecione o período para visualizar
- **Filtro de Materiais** — Mês e Ano separados para análise de mix

### Exportar em PDF

1. Clique em **"Gerar PDF"**
2. Veja o preview do relatório
3. Imprima ou salve como PDF

---

## 15. FLUXOGRAMA OPERACIONAL DO SISTEMA

### Fluxo de Produção

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUXO DE PRODUÇÃO                            │
└─────────────────────────────────────────────────────────────────┘

CLIENTE SOLICITA ORÇAMENTO
(Loja Virtual / WhatsApp / Presencial)
          │
          ▼
┌─────────────────────┐
│    ORÇAMENTO CRIADO  │
│    Status: Pendente  │
└─────────────────────┘
          │
          ▼
     ORÇAMENTO
     ENVIADO AO CLIENTE
          │
          ▼
     ┌────┴────┐
     │         │
 APROVADO   REJEITADO
     │         │
     ▼         ▼
┌─────────┐  ┌──────────┐
│ CRIAÇÃO │  │ ARQUIVADO │
│ DE CAIXA│  └──────────┘
│ (Receita)│
└─────────┘
     │
     ▼
┌─────────────────────┐
│   PRODUÇÃO CRIADA   │
│   Status: Na Fila   │
└─────────────────────┘
     │
     ▼
┌─────────────────────┐
│    EM PRODUÇÃO      │
│   (Imprimindo)      │
└─────────────────────┘
     │
     ▼
┌─────────────────────┐
│     FINALIZADO      │
│  (Controle Qualidade)│
└─────────────────────┘
     │
     ▼
┌─────────────────────┐
│      ENTREGUE       │
│ (Cliente Recebe)    │
└─────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│                    AUTOMATICAMENTE                           │
│ ✅ Materiais descontados do estoque                          │
│ ✅ Totais da impressora atualizados                          │
│ ✅ Histórico do cliente atualizado                           │
└─────────────────────────────────────────────────────────────┘
```

### Fluxo de Estoque

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONTROLE DE ESTOQUE                          │
└─────────────────────────────────────────────────────────────────┘

CADASTRO DO PRODUTO COM MATERIAIS
(Ex: 1 Suporte = 50g PLA + 10g PETG)
          │
          ▼
┌─────────────────────┐
│    ESTOQUE CALCULADO │
│    Automaticamente   │
│    pelos materiais   │
└─────────────────────┘
          │
          ▼
PEDIDO CRIADO → MATERIAIS DESCONTADOS
          │
          ▼
┌─────────────────────────────────────────┐
│ Se estoque > 10 → "Estoque: X un"      │
│ Se estoque 1-10 → "Últimas X un"       │
│ Se estoque = 0  → "Sem estoque"        │
└─────────────────────────────────────────┘
          │
          ▼
PEDIDO CANCELADO → MATERIAIS DEVOLVIDOS
```

### Resumo do Fluxo

| Etapa | O que acontece | Estoque | Financeiro |
|-------|----------------|---------|------------|
| Orçamento criado | Entra como Pendente | Sem mudança | — |
| Orçamento aprovado | Gera lançamento de receita | Sem mudança | Receita criada |
| Produção iniciada | Move para "Em Produção" | Sem mudança | — |
| Produção finalizada | Registra qualidade e效率 | Descontado | — |
| Pedido entregue | Cliente recebe | Sem mudança | — |
| Pedido cancelado | Estoque devolvido | Devolvido | Sem mudança |

---

## 16. SISTEMA MULTIEMPRESA

### Como Funciona

O sistema é multiempresa, o que significa que cada estabelecimento opera de forma completamente separada:

- Cada empresa possui seus próprios dados — Produtos, clientes, pedidos e financeiro são independentes
- Cada empresa possui sua própria loja virtual — Link único para cada loja
- Cada empresa possui seus próprios clientes — Cadastros não se misturam
- Cada empresa possui seu próprio estoque — Materiais e produtos são individuais
- Nenhuma empresa visualiza dados de outra — Segurança e privacidade garantidas

> **VANTAGEM:** Se você tem mais de uma filial, cada uma opera como um negócio independente, com seus próprios relatórios.

---

## 17. SEGURANÇA DOS DADOS

### Como Seus Dados São Protegidos

- **Dados armazenados em nuvem** — Acesso de qualquer lugar, a qualquer hora
- **Acesso protegido por login e senha** — Apenas usuários autorizados entram no sistema
- **Separação automática por empresa** — Cada empresa só vê seus próprios dados
- **Atualizações centralizadas** — Melhorias chegam automaticamente sem necessidade de instalação
- **Backup realizado na infraestrutura do sistema** — Seus dados estão seguros

---

## 18. DICAS IMPORTANTES

### Boas Práticas

- **Atualize o estoque** sempre que receber material novo
- **Registre todos os orçamentos** para ter dados reais nos relatórios
- **Cadastre clientes** para manter histórico completo
- **Verifique o Dashboard** diariamente para acompanhar resultados
- **Configure a loja virtual** para receber pedidos online
- **Crie orçamentos profissionais** e envie via WhatsApp
- **Calibre as impressoras** regularmente para manter qualidade
- **Registre a qualidade** das peças produzidas

### Alertas

- **Estoque crítico:** Quando um material está abaixo do mínimo, aparece um alerta no Dashboard
- **Impressoras em manutenção:** Aparece no Dashboard
- **Orçamentos pendentes:** Mostrados no card do Dashboard

---

## 19. PERGUNTAS FREQUENTES (FAQ)

### GERAL

**Preciso de conhecimento técnico para usar o sistema?**
Não. O sistema foi feito para ser simples. Se você sabe usar um celular, sabe usar o PrintPulse 3D.

**Funciona em qualquer dispositivo?**
Sim. Computador, tablet e celular. Basta ter acesso à internet.

**Preciso instalar algum programa?**
Não. Tudo é online. Você acessa pelo navegador (Chrome, Safari, Edge).

### ESTOQUE

**O estoque baixa sozinho?**
Sim. Quando você cadastra os materiais do produto, o sistema desconta automaticamente ao finalizar a produção.

**Posso usar sem cadastrar materiais?**
Sim. Você pode controlar o estoque manualmente sem vincular ao produto.

**O que acontece quando o estoque chega a zero?**
O produto aparece como "Sem estoque no momento" na loja virtual e fica indisponível para venda.

### ORÇAMENTOS

**Posso criar orçamentos com múltiplos itens?**
Sim. Adicione quantos produtos precisar no orçamento.

**Posso enviar orçamento via WhatsApp?**
Sim. O sistema gera uma mensagem formatada e envia direto para o WhatsApp.

**O que acontece se o cliente não responder?**
O orçamento tem validade. Após a data, ele pode ser arquivado.

### LOJA VIRTUAL

**Preciso ter loja virtual para usar o sistema?**
Não. Você pode usar apenas o app. A loja virtual é um complemento opcional.

**A loja virtual cobra comissão por pedido?**
Não. Diferente do Mercado Livre, não há taxa por venda. É 100% seu.

**Como o cliente acessa a loja?**
Pelo link único da sua loja (ex: seu-dominio.com/loja/seu-id).

**O cliente precisa se cadastrar?**
Não. Ele é cadastrado automaticamente ao fazer o primeiro pedido.

**Posso personalizar a loja virtual?**
Sim. Logo, cores, descrição, imagem de capa, redes sociais e texto institucional.

### FINANCEIRO

**O sistema cria lançamentos automáticos?**
Sim. Ao aprovar orçamento (receita).

**Posso editar um lançamento?**
Sim. Clique no lápis ao lado do lançamento.

**Posso excluir um lançamento?**
Sim. Clique na lixeira. Cuidado: essa ação não pode ser desfeita.

### PRODUÇÃO

**Como acompanho o progresso da impressão?**
Pelo painel de Produção, que funciona como um Kanban com colunas: Na Fila, Em Produção, Finalizado, Arquivado.

**Posso cancelar um pedido em produção?**
Sim. Os materiais são devolvidos automaticamente ao estoque.

**Como registro a qualidade das peças?**
Ao finalizar uma produção, o sistema abre um modal de controle de qualidade onde voce informa peças boas, defeituosas e notas.

### IMPRESSORAS

**Posso cadastrar quantas impressoras?**
Sim. Não há limite. Cadastre quantas precisar.

**Como coloco uma impressora em manutenção?**
Altere o status para "Em Manutenção". Ela será sinalizada no Dashboard.

**A impressora rastreia horas de uso?**
Sim. O sistema acumula horas automaticamente a cada produção finalizada.

---

## 20. SUPORTE TÉCNICO

### Canais de Atendimento

| Canal | Contato | Horário |
|-------|---------|---------|
| WhatsApp | (12) 99704-1393 | 08h às 18h |
| E-mail | eduardowillians40@gmail.com | 08h às 18h |

### Antes de Entrar em Contato

1. Verifique se o problema não é descrito neste guia
2. Tenha em mãos o **nome da sua loja**
3. Descreva o problema com detalhes (prints são bem-vindos)

---

## 21. PRÓXIMAS FUNCIONALIDADES

O PrintPulse 3D está em constante evolução. Em breve, teremos:

- **Upload de arquivos STL** — Envio direto de modelos 3D para orçamento
- **Visualizador 3D online** — Visualize peças antes de imprimir
- **Simulação automática de custo** — Cálculo instantâneo baseado no arquivo
- **Integração com Bambu Studio** — Envio direto para impressoras Bambu Lab
- **Integração com Cura** — Compatibilidade com o software de fatiamento
- **Controle de manutenção preventiva** — Alertas automáticos de manutenção
- **Portal do cliente** — Acompanhamento de pedidos pelo cliente
- **Aprovação online de orçamentos** — Cliente aprova/rejeita pelo link
- **Integração PIX automática** — Confirmação de pagamento automática

> **MANTENHA-SE ATUALIZADO:** Novas funcionalidades são adicionadas regularmente para melhorar sua experiência.

---

## 22. SOBRE O PRINTPULSE 3D

Transformando a gestão da sua loja de impressão 3D em um processo simples, organizado e lucrativo.

### Principais Benefícios

| Benefício | Descrição |
|-----------|-----------|
| ✅ Controle de Produção | Gerencie impressoras e pedidos em tempo real |
| ✅ Estoque Automático | Controle de materiais com desconto automático |
| ✅ Orçamentos Profissionais | Crie e envie orçamentos via WhatsApp |
| ✅ Loja Virtual Própria | Catálogo online sem comissão de marketplace |
| ✅ Controle Financeiro | Receitas, despesas e lucro em tempo real |
| ✅ Relatórios Gerenciais | Gráficos, KPIs e exportação em PDF |
| ✅ Gestão Multiempresa | Una filiais com dados separados e seguros |

### Contato

| Canal | Informação |
|-------|------------|
| WhatsApp | (12) 99704-1393 |
| E-mail | eduardowillians40@gmail.com |

---

**PrintPulse 3D — Sistema de Gestão para Lojas de Impressão 3D**
**Guia versão 1.0 — Junho de 2026**
