---
name: frontend-standards
description: Padrões de UI/UX, responsividade e componentes para o Precifix.
---

# Padrões de Frontend do Precifix

Use estas diretrizes ao criar ou editar interfaces. O objetivo é manter consistência visual e usabilidade entre Mobile e Desktop.

## 1. Responsividade e UX (Mobile First)
- **Ações Principais (FAB):**
  - **Mobile:** Obrigatório usar o componente `<ResponsiveAddButton />` (botão circular amarelo flutuante) para ações de criação (ex: Novo Produto, Nova Venda).
  - **Desktop:** Use `<Button>` padrão do Shadcn na barra de topo ou locais contextuais.
- **Entrada de Dados (Formulários):**
  - **Mobile:** Use componentes `<Drawer>` (Sheet/Drawer) para formulários de inclusão/edição. É mais ergonômico para toque.
  - **Desktop:** Use `<Dialog>` (Modal) ou formulários em linha/página dedicada.
  - *Implementação:* Use um hook como `useMobile` (se disponível) ou `window.matchMedia` para renderizar condicionalmente o wrapper correto.

## 2. Theming (Dark/Light Mode)
- **Consistência Total:** Todas as telas devem funcionar perfeitamente em Light e Dark mode.
- **Cores:**
  - Use **apenas** classes do Tailwind com variáveis CSS (ex: `bg-background`, `text-foreground`, `border-border`).
  - **Proibido:** Usar cores hexadecimais fixas ou classes que não se adaptam (ex: `text-black` ou `bg-white` sem variante dark).
  - Teste sempre o contraste.

## 3. Stack Tecnológica
- **Estilização:** Tailwind CSS v4.
- **Componentes:** Shadcn/UI (baseado em Radix UI).
- **Ícones:** Lucide React.
- **Feedback:** Use `sonner` para Toasts.

## Exemplo de Estrutura Responsiva
```tsx
const isMobile = useMobile() // ou hook equivalente

if (isMobile) {
  return <Drawer><DrawerContent>{/* Form */}</DrawerContent></Drawer>
}
return <Dialog><DialogContent>{/* Form */}</DialogContent></Dialog>
```
