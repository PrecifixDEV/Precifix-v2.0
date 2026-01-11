# Master Task - Módulo Financeiro (Precifix v2.0)

Este documento centraliza o status de desenvolvimento do módulo financeiro do Precifix v2.0. Ele serve como um guia mestre para entender o que já foi construído, como funciona a lógica atual e o que ainda precisa ser feito.

**Localização:** `docs/MASTER_TASK_FINANCEIRO.md`
**Atualizado em:** 11/01/2026

---

## 1. Visão Geral e Contexto
O objetivo do módulo financeiro é permitir que o esteticista automotivo tenha controle total sobre a lucratividade do seu negócio. Isso vai além do simples "Contas a Pagar/Receber". O sistema calcula o **Custo Hora** da operação baseando-se nas despesas fixas/variáveis e nas horas trabalhadas, permitindo uma precificação de serviços extremamente precisa que considera custos de produtos (diluição), mão de obra e comissões.

---

## 2. Funcionalidades Implementadas (Log Completo)

### A. Gestão de Custos Operacionais (`ManageCosts.tsx`, `costService.ts`)
O sistema já permite o lançamento completo de despesas que formam a base do cálculo de custo hora.
- [x] **CRUD de Custos:** Criação, Edição e Exclusão de custos operacionais.
- [x] **Classificação:** Custos são tipados como `Fixo` ou `Variável`.
- [x] **Recorrência Inteligente:**
    - Suporte a frequências: Diária, Semanal, Mensal, Anual.
    - O sistema projeta e insere automaticamente as ocorrências futuras no banco de dados (limite de 5 anos) para permitir previsibilidade em meses futuros.
    - Deleção em cascata (opcional) de grupos de recorrência.
- [x] **Dashboard de Custos:**
    - Filtros por Mês e Ano.
    - Separação visual entre Tabelas de Custos Fixos e Variáveis.
- [x] **Cálculo de Custo Operacional:**
    - **Cálculo de Dias Úteis:** Baseado na configuração de horário de funcionamento (`operational_hours`).
    - **Custo Diário:** (Total Despesas Mês) / (Dias Trabalhados).
    - **Custo Hora:** (Total Despesas Mês) / (Horas Totais Trabalhadas).

### B. Precificação de Serviços (`ServiceFormDialog.tsx`)
A precificação é dinâmica e consome os dados gerados na Gestão de Custos.
- [x] **Cálculo de Custo Hora Automático:**
    - O formulário de serviço busca automaticamente o total de custos do mês atual e divide pelas horas operacionais cadastradas para sugerir um "Custo Mão de Obra/Hora".
- [x] **Custear Produtos (Com Diluição):**
    - Seleção de produtos do estoque (apenas não vendáveis/consumo).
    - **Lógica de Diluição:** Permite definir diluição (ex: 1:10) e calcula o custo exato apenas da quantidade de solução usada no carro.
    - Suporte a produtos "Pronto Uso".
- [x] **Análise de Lucratividade em Tempo Real:**
    - Calcula o Custo Total do Serviço somando:
        - Custo Mão de Obra (Tempo x Custo Hora).
        - Comissão (%).
        - Custo Produtos (Soma do custo fracionado de cada produto).
        - Outros custos fixos adicionais.
    - Exibe **Lucro Líquido** (Preço Venda - Custo Total).
    - Exibe **Margem de Lucro %**.

### C. Contas e Transações (`financialService.ts`, `FinancialOverview.tsx`)
Estrutura básica de caixa e fluxo financeiro.
- [x] **Gestão de Contas (Carteiras):**
    - Cadastro de contas (ex: Banco Inter, Caixa Física).
    - Saldo inicial e atual.
- [x] **Transações:**
    - Registro de entradas (Crédito) e saídas (Débito).
    - Atualização atômica do saldo da conta vinculada.
- [x] **Planejamento Financeiro (Overview):**
    - Definição de metas de **Capital de Giro**.
    - Controle de **Retorno de Investimento (ROI)**.
    - Visualização de Ponto de Equilíbrio (embora precise de revisão se está 100% integrado ao dashboard principal).
    - [x] **Lista de Transações Avançada (TransactionList):**
        - Filtros por: Data, Tipo (Entrada/Saída), Busca Textual e **Status (Ativo/Excluído)**.
        - **Soft Delete e Restauração:** Transações podem ser excluídas (ocultas) e restauradas posteriormente, revertendo/reaplicando o saldo automaticamente.
        - **Paginação:** Listagem paginada para melhor performance visual.
        - **Impressão:** Layout de impressão otimizado e limpo (oculta menus e gráficos).

### D. Estrutura de Banco de Dados (Supabase)
Tabelas principais já criadas e em uso:
- `operational_costs`: Despesas fixas/variáveis.
- `operational_hours`: Horários de funcionamento (base para cálculo de horas).
- `commercial_accounts`: Contas bancárias/caixas.
- `financial_transactions`: Extrato financeiro.
- `products` & `service_products`: Produtos e relação com serviços (incluindo campos de diluição).

---

## 3. Próximos Passos (A Fazer / Revisar)
*Preencha esta seção com as demandas pendentes.*

### Prioridade Alta
- [ ] **Integração Venda -> Financeiro:** Quando uma Ordem de Serviço é finalizada, ela deve gerar automaticamente uma transação de "Entrada" na conta selecionada? (Verificar se isso já existe no `erpService`).
- [ ] **Relatórios Detalhados:** Criar gráficos de evolução de custos x faturamento no Dashboard principal (atualmente temos cards, mas falta histórico visual detalhado).
- [ ] **Revisão de Edição de Recorrência:** Atualmente a edição de um custo recorrente edita apenas a instância atual. Precisamos de um diálogo "Editar este, este e futuros, ou todos"?

### Melhorias de Interface
- [ ] ...
- [ ] ...

### Correções / Bugs Conhecidos
- [ ] ...

---

## 4. Glossário de Cálculos (Lógica Atual)

**1. Custo Hora do Sistema:**
```typescript
TotalDespesasMes = Soma(Custos Fixos + Custos Variáveis do Mês)
TotalHorasMes = (MinutosSemanaisTrabalhados * 4.345) / 60
CustoHora = TotalDespesasMes / TotalHorasMes
```

**2. Custo de Produto Diluído:**
```typescript
Ratio = ParteProduto / ParteAgua (ex: 1:10 -> ratio 10? Verificar se é 1+10 ou 1/10. No código atual usamos divisão direta pelo ratio informado).
CustoPorMlConcentrado = PrecoPago / TamanhoEmbalagemOriginal
CustoPorMlDiluido = CustoPorMlConcentrado / Ratio
CustoFinal = QuantidadeSolucaoUsada * CustoPorMlDiluido
```
