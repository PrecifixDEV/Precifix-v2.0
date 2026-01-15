---
name: clean-code-refactoring
description: Regras para refatoração limpa e prevenção de código macarrão
---

# Clean Code Refactoring - Regras de Refatoração

## 🎯 Princípio Fundamental

**SEMPRE que avaliar que a estrutura vai ficar quebrada ou acabar se transformando em "código macarrão", PARE e crie um arquivo novo com código limpo ao invés de tentar consertar.**

## 🚨 Sinais de Alerta - Quando Reescrever

Reescreva o arquivo do zero se identificar **qualquer um** destes sinais:

### 1. Erros Acumulados
- ❌ Múltiplos erros de lint após edições incrementais
- ❌ Erros de tipo que se multiplicam a cada edição
- ❌ Imports não utilizados acumulando
- ❌ Variáveis/funções órfãs após remoções

### 2. Estrutura Confusa
- ❌ Lógica espalhada em múltiplos lugares
- ❌ Funções muito longas (>100 linhas)
- ❌ Muitos níveis de aninhamento (>4 níveis)
- ❌ Código comentado acumulando

### 3. Edições Incrementais Excessivas
- ❌ Mais de 5 edições no mesmo arquivo na mesma sessão
- ❌ Edições que criam novos erros ao tentar corrigir outros
- ❌ "Gambiarra" temporária que vira permanente
- ❌ Dificuldade em entender o próprio código após edições

### 4. Mudança de Requisitos
- ❌ Requisito mudou significativamente
- ❌ Lógica antiga não se aplica mais
- ❌ Tentando adaptar código para algo diferente do original

## ✅ Processo de Reescrita

Quando decidir reescrever:

### 1. Análise
```markdown
1. Identifique o que DEVE ser mantido (lógica core)
2. Identifique o que DEVE ser removido (código obsoleto)
3. Identifique o que DEVE ser simplificado
```

### 2. Planejamento
```markdown
1. Liste as funcionalidades essenciais
2. Desenhe a nova estrutura (componentes, funções)
3. Defina interfaces/tipos necessários
4. Planeje a ordem de implementação
```

### 3. Implementação
```markdown
1. Crie arquivo novo com código limpo
2. Implemente funcionalidades uma por uma
3. Teste cada parte conforme implementa
4. Use `write_to_file` com `Overwrite: true`
```

### 4. Validação
```markdown
1. Verifique se não há erros de lint
2. Confirme que todas funcionalidades estão presentes
3. Compare com requisitos originais
4. Documente mudanças significativas
```

## 📋 Checklist Antes de Editar

Antes de fazer edições incrementais, pergunte-se:

- [ ] Esta edição vai criar mais de 3 novos erros?
- [ ] Estou tentando "consertar" código que já está confuso?
- [ ] Já fiz mais de 3 edições neste arquivo nesta sessão?
- [ ] A estrutura atual suporta esta mudança?
- [ ] Seria mais rápido reescrever do zero?

**Se respondeu SIM a qualquer pergunta:** Considere reescrever.

## 🎓 Exemplos Práticos

### ❌ Exemplo Ruim - Edições Incrementais
```typescript
// Edição 1: Adicionar campo
interface Product {
  name: string;
  quantity: number; // Adicionado
}

// Edição 2: Adicionar mais campos
interface Product {
  name: string;
  quantity: number;
  dilution_ratio: string; // Adicionado
  container_size: number; // Adicionado
}

// Edição 3: Remover campos (mas deixa código órfão)
interface Product {
  name: string;
  // quantity removido mas funções que usam ainda existem
}

// Resultado: Código confuso, erros acumulados
```

### ✅ Exemplo Bom - Reescrita Limpa
```typescript
// Reescrita completa com nova lógica
interface Product {
  id: string;
  name: string;
  category: string;
  // Apenas campos necessários, estrutura clara
}

// Funções limpas e focadas
const getProductName = (product: Product) => product.name;
const isProductValid = (product: Product) => !!product.id && !!product.name;
```

## 🏆 Benefícios da Reescrita

1. **Código Limpo**: Sem resíduos de edições anteriores
2. **Sem Erros**: Começa do zero, sem erros acumulados
3. **Manutenível**: Estrutura clara e organizada
4. **Rápido**: Muitas vezes mais rápido que consertar
5. **Confiável**: Menos bugs escondidos

## 📝 Comunicação com Usuário

Quando decidir reescrever, comunique claramente:

```markdown
**Sugestão:** Detectei [SINAIS DE ALERTA]. 
Seria melhor reescrever este arquivo do zero com código limpo 
ao invés de tentar consertar. Isso vai resultar em:
- Código mais limpo e manutenível
- Sem erros residuais
- Estrutura mais clara

Posso prosseguir com a reescrita?
```

## 🎯 Regra de Ouro

> **"Se você está lutando contra o código, reescreva. 
> Se o código está lutando contra você, reescreva.
> Código limpo é sempre melhor que código consertado."**

## 📊 Métricas de Sucesso

Uma boa reescrita deve resultar em:
- ✅ Zero erros de lint
- ✅ Código 30-50% menor
- ✅ Funções com responsabilidade única
- ✅ Estrutura clara e organizada
- ✅ Fácil de entender e manter

---

**Lembre-se:** Tempo gasto em reescrita limpa é investimento, não custo.
