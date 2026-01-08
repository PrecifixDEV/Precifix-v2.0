# Projeto: Precifix v2.0
**Contexto:** SaaS de Gestão (ERP) para Estética Automotiva.
**Objetivo:** Controle de despesas, faturamento e precificação.

## 1. Stack Tecnológica
- **Frontend:** React + Vite
- **Estilização:** Tailwind CSS (Foco em Design Mobile-First)
- **Backend/Banco:** Supabase (Auth, Database, Storage)
- **Deploy:** Vercel

## 2. Estrutura de Diretórios e Referência
- **Root:** `C:\Users\Leo Vitorino\Antigravity-apps\Precifix-v2.0`
- **Referência:** `C:\Users\Leo Vitorino\Antigravity-apps\Precifix-v2.0\Backup_precifixv1.0`
  - **REGRAS DE REFERÊNCIA:** Esta pasta serve APENAS para consulta de lógica e legado. Não escreva novos arquivos nela. Não execute comandos nela. Use-a para entender como o v1.0 funcionava e transpor as regras de negócio para a estrutura moderna do v2.0.

## 3. Diretrizes de Desenvolvimento
### UI/UX (Mobile-First)
- A aplicação deve ser totalmente responsiva.
- O foco principal é o uso em dispositivos móveis (chão de oficina), seguido por desktop.
- Utilize componentes Tailwind para interfaces limpas e botões acessíveis para toque.

### Segurança e LGPD
- **Privacidade por Design:** Coletar apenas dados estritamente necessários.
- **Supabase RLS:** Todo acesso ao banco deve ser protegido por Row Level Security (RLS). O usuário só pode ver/editar seus próprios dados.
- **Tratamento de Dados:** Implementar logs de exclusão e garantir que o usuário possa exportar ou excluir seus dados conforme a LGPD.
- **Sanitização:** Validar e sanitizar todos os inputs no frontend e via políticas de banco.


## 4. Instruções para o Agente
- Sempre verifique se o código gerado respeita as políticas de RLS do Supabase.
- Antes de criar uma nova funcionalidade, verifique se existe lógica similar no `Backup_precifixv1.0`.
- Mantenha o código modular e com tipagem rigorosa (se aplicável).

## Padrões de UI (Estrita Observância)

1. **Botões de Ação Principal (Adicionar/Novo):**
   - NUNCA crie botões `Button` manuais para ações de "Adicionar" ou "Novo Item".
   - SEMPRE use o componente `<ResponsiveAddButton onClick={...} label="..." />`.
   - Este botão garante o padrão visual: Amarelo, Circular com "+" no Mobile, Retangular com Texto no Desktop.
