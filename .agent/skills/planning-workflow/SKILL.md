---
name: planning-workflow
description: Sistema de planejamento e continuidade entre sessões
---

# Planning Workflow - Precifix

## 🎯 Objetivo

Manter continuidade perfeita entre sessões de desenvolvimento, permitindo trabalho em múltiplos dispositivos sem perda de contexto.

## 📂 Localização

Todos os arquivos de planejamento estão em `.agent/planning/`

## 🔄 Workflow Obrigatório

### AO INICIAR QUALQUER SESSÃO

**SEMPRE execute estes passos ANTES de começar qualquer trabalho:**

1. **Leia `.agent/planning/task.md`**
   - Veja o que está pendente, em progresso e concluído
   - Identifique a próxima tarefa prioritária

2. **Leia `.agent/planning/walkthrough.md`**
   - Entenda o que foi feito na última sessão
   - Veja exemplos de código e padrões estabelecidos
   - Identifique decisões de design importantes

3. **Consulte `.agent/planning/session-log.md`** (se necessário)
   - Para contexto histórico de decisões
   - Para entender evolução do projeto

### DURANTE A SESSÃO

1. **Atualize `task.md`** conforme progride
   - Marque `[/]` quando iniciar uma tarefa
   - Marque `[x]` quando completar
   - Adicione novas tarefas descobertas

2. **Documente decisões importantes**
   - Anote mudanças de arquitetura
   - Registre padrões estabelecidos

### AO FINALIZAR A SESSÃO

1. **Atualize `task.md`** com status final

2. **Crie/Atualize `walkthrough.md`**
   - Resumo completo do que foi feito
   - Exemplos de código relevantes
   - Screenshots/recordings se aplicável

3. **Adicione entrada em `session-log.md`**
   ```markdown
   # Session - YYYY-MM-DD HH:MM

   ## Trabalho Realizado
   - Item 1
   - Item 2

   ## Arquivos Principais Modificados
   - `path/file.tsx` - descrição

   ## Decisões Importantes
   - Decisão 1
   - Decisão 2
   ```

4. **Commit tudo para o Git**
   ```bash
   git add .agent/planning/
   git commit -m "docs: atualização de planejamento - [resumo]"
   git push
   ```

## ⚠️ REGRAS CRÍTICAS

1. **NUNCA** comece a trabalhar sem ler os arquivos de planejamento
2. **SEMPRE** atualize os arquivos ao finalizar
3. **SEMPRE** faça commit dos arquivos de planejamento
4. **NUNCA** delete ou sobrescreva histórico em `session-log.md`

## 📝 Formato dos Arquivos

### task.md
```markdown
# Task List

## Categoria
- [ ] Tarefa pendente
- [/] Tarefa em progresso
- [x] Tarefa concluída
```

### walkthrough.md
```markdown
# Walkthrough - [Título da Sessão]

## Resumo
Descrição geral

## Implementações
### Feature 1
Detalhes...

## Próximos Passos
- [ ] Item 1
```

### session-log.md
```markdown
# Session - YYYY-MM-DD

## Trabalho Realizado
...

(Mais recente primeiro)
```

## 🎯 Benefícios

✅ Continuidade perfeita entre PCs
✅ Histórico completo de decisões
✅ Onboarding rápido de novos desenvolvedores
✅ Rastreabilidade de mudanças
✅ Sincronização automática via Git
