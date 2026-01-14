---
name: project-structure
description: Guia da estrutura de pastas e arquivos do Precifix.
---

# Estrutura de Arquivos do Precifix

Mantenha a organização rigorosa para facilitar a manutenção.

## Diretórios Principais
- `src/pages/`: Páginas completas (rotas). Agrupe por módulo se necessário (ex: `src/pages/financial/`).
- `src/components/ui/`: Componentes base do Shadcn. **Não modifique** a menos que seja uma alteração global do Design System.
- `src/components/[feature]/`: Componentes específicos de uma funcionalidade (ex: `src/components/sales/SalesTable.tsx`).
- `src/hooks/`: Custom hooks (lógica de negócio, ex: `useMobile.tsx`).
- `src/services/`: Camada de serviço para Supabase e Storage (ex: `productService.ts`). Lógica de banco e limpeza de imagens fica aqui.
- `src/utils/`: Funções puras (ex: `imageUtils.ts`, `format.ts`).
- `src/lib/`: Configurações de libs (Supabase client, utils do shadcn).

## Diretório .agent (Configuração e Planejamento)
- `.agent/skills/`: Skills para orientar o desenvolvimento (leia sempre que relevante)
- `.agent/planning/`: **CRÍTICO** - Sistema de continuidade entre sessões
  - `task.md`: Checklist de tarefas atual
  - `walkthrough.md`: Resumo da última sessão
  - `session-log.md`: Histórico cronológico de todas as sessões
  - `README.md`: Documentação do sistema de planejamento

**⚠️ IMPORTANTE**: Sempre leia `.agent/planning/task.md` e `.agent/planning/walkthrough.md` ao iniciar uma sessão!

## Convenções
- **Nomes de Arquivo:** PascalCase para Componentes (`UserProfile.tsx`), camelCase para hooks/utils (`useAuth.ts`).
- **Layout:** Novas rotas autenticadas devem ficar dentro do `MainLayout` (que gerencia Sidebar/Header).
