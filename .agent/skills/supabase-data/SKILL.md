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
