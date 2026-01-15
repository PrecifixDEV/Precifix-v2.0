---
name: supabase-data
description: Diretrizes de segurança, RLS, banco de dados e manipulação de arquivos (Storage).
---

# Padrões de Dados e Storage

## 1. Segurança Obrigatória (RLS)
- **Princípio Zero:** O Frontend é inseguro. A segurança real vem do Banco de Dados.
- **RLS (Row Level Security):** Todas as tabelas devem ter RLS habilitado.
- **Policies:**
  - Crie políticas SQL que usem `auth.uid()` para garantir que usuários só acessem seus próprios dados (ou da sua organização).
  - *Exemplo:* `create policy "Users can see own data" on "table" using (auth.uid() = user_id);`
- **Queries Seguras:** Não filtre dados sensíveis no Javascript (ex: `filter()`). A query do Supabase já deve retornar apenas o permitido.

## 2. Gestão de Imagens e Storage (Crítico)
Otimização para economizar espaço e performance no Supabase.
- **Upload (Frontend):**
  - **Obrigatório:** Use a função `compressAndConvertToWebP` (de `src/utils/imageUtils.ts`) antes de qualquer upload.
  - **Padrão:** WebP, qualidade 80%, redimensionado para max 1200px.
- **Manutenção (Backend Logic/Service):**
  - **Ao Deletar Registro:** O código deve buscar o caminho da imagem e deletá-la do bucket (`storage.from(...).remove()`) **antes** ou junto com a deleção do registro.
  - **Ao Atualizar Imagem:** Se a imagem foi substituída, delete explicitamente a imagem antiga do bucket para não deixar arquivos "órfãos".

## 3. React Query & Data Fetching
- Use Hooks do React Query (`useQuery`) para GETs.
- Use `useMutation` para INSERT/UPDATE/DELETE.
- Sempre invalide o cache (`queryClient.invalidateQueries`) após uma mutação bem-sucedida.

## 4. Gestão do types.ts e Schema do Banco (CRÍTICO)

### ⚠️ REGRA DE OURO: Código e Banco SEMPRE Sincronizados

**NUNCA modifique o schema do banco sem atualizar o código imediatamente, ou vice-versa.**

### Workflow Obrigatório para Mudanças de Schema:

#### Passo 1: Criar Migration
```bash
# Criar arquivo de migration em supabase/migrations/
# Formato: YYYYMMDDHHMMSS_description.sql
```

#### Passo 2: Aplicar Migration no Banco
- Use o agente do Supabase MCP para aplicar a migration
- OU execute manualmente via Supabase Dashboard

#### Passo 3: Regenerar types.ts IMEDIATAMENTE
```bash
npx supabase gen types typescript --project-id <project-id> > src/integrations/supabase/types.ts
```

#### Passo 4: Atualizar Código
- Ajuste TODOS os arquivos que usam os tipos modificados
- Procure por referências aos campos alterados/removidos
- Use `grep` para encontrar todas as ocorrências

#### Passo 5: Testar Build
```bash
npm run build
```
**Se houver erros, corrija ANTES de commitar!**

#### Passo 6: Commit Atômico
```bash
git add supabase/migrations/<migration-file>.sql
git add src/integrations/supabase/types.ts
git add <arquivos-modificados>
git commit -m "feat: [descrição da mudança de schema]"
```

### ❌ O QUE NUNCA FAZER:

1. **NUNCA** modifique tabelas diretamente no Supabase Dashboard sem criar migration
2. **NUNCA** commite código que depende de schema não migrado
3. **NUNCA** regenere `types.ts` sem testar o build depois
4. **NUNCA** reverta código sem verificar se o banco está compatível
5. **NUNCA** faça `git reset` sem verificar o estado do `types.ts`

### ✅ Checklist Antes de Qualquer Mudança de Schema:

- [ ] Migration criada em `supabase/migrations/`
- [ ] Migration aplicada no banco
- [ ] `types.ts` regenerado
- [ ] Código atualizado para usar novos tipos
- [ ] `npm run build` executado com sucesso (0 erros)
- [ ] Commit inclui migration + types.ts + código

### 🔍 Como Verificar Sincronização:

```bash
# 1. Verificar se types.ts está atualizado
npx supabase gen types typescript --project-id <project-id> > temp-types.ts
diff src/integrations/supabase/types.ts temp-types.ts

# 2. Se houver diferenças, o banco e o types.ts estão DESSINCRONIZADOS
# 3. Regenere o types.ts e ajuste o código conforme necessário
```

### 📝 Exemplo de Migration Segura:

```sql
-- supabase/migrations/20260115000000_add_field_to_products.sql

-- Adicionar campo com default para não quebrar código existente
ALTER TABLE products 
ADD COLUMN new_field TEXT DEFAULT 'default_value';

-- Comentário: Atualizar types.ts após aplicar esta migration
```

### 🚨 Recuperação de Dessincronia:

Se código e banco estiverem dessincronizados:

1. **Identifique o último commit estável** (onde build funcionava)
2. **Reverta o código** para esse commit
3. **Verifique o types.ts** desse commit
4. **Compare com o banco atual** usando o agente Supabase
5. **Decida**: Reverter banco OU atualizar código gradualmente

### 💡 Dica: Backup do types.ts

Antes de regenerar, sempre faça backup:
```bash
cp src/integrations/supabase/types.ts src/integrations/supabase/types.ts.backup
```
