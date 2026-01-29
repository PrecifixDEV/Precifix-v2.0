---
name: frontend-standards
description: Padrões de UI/UX, responsividade e componentes para o Precifix.
---

# Padrões de Frontend do Precifix

## Responsividade

> [!IMPORTANT]
> **Mobile First**: A aplicação vai ser mobile first. Se ficar bom no mobile, provavelmente ficará bom no desktop. Sempre priorize a experiência em telas pequenas (< 768px) antes de expandir para layouts maiores.

## Cores e Tema (Industrial Theme)

### Dark Mode
- **Fundo da Página**: `bg-zinc-900` (#18181b)
- **Fundo de Navegação (Top/Bottom/Side)**: `bg-black` (#000000)
- **Elementos de Card/Sheet**: `bg-zinc-900`
- **Bordas**: `border-zinc-800`
- **Inputs**: `bg-zinc-950` com border `border-zinc-800`

## Entrada de Dados (Formulários)

> [!IMPORTANT]
> **Padrão Único**: Todos os formulários de criação e edição devem usar o componente **Sheet** (`side="right"`).
> **NÃO USE** `Dialog` ou `Drawer` para formulários complexos. O objetivo é manter a consistência visual e o "feel" de painel lateral robusto.

### Estrutura do Sheet (Formulário)

Siga estritamente esta estrutura para manter a consistência com a página de Produtos:

```tsx
<Sheet open={open} onOpenChange={onOpenChange}>
    {/* Classes: Largura fixa 600px, Fundo correto, Sombra, Sem padding padrão (p-0) para controle total */}
    <SheetContent className="sm:max-w-[600px] w-full p-0 flex flex-col bg-white dark:bg-zinc-900 shadow-xl z-[100]" side="right">
        
        {/* HEADER: Amarelo Industrial com Texto Preto */}
        <SheetHeader className="h-16 px-6 shadow-md flex justify-center shrink-0 bg-yellow-500">
            <SheetTitle className="text-zinc-900 text-center font-bold">
                {isEditing ? 'Editar Item' : 'Novo Item'}
            </SheetTitle>
        </SheetHeader>

        {/* BODY: Área com Scroll */}
        <div className="overflow-y-auto px-6 py-4 flex-1">
            <form id="my-form" className="space-y-6">
                {/* Campos do formulário */}
                <div className="space-y-2">
                    <Label>Nome</Label>
                    <Input className="bg-white dark:bg-zinc-800" />
                </div>
            </form>
        </div>

        {/* FOOTER: Fixo na parte inferior */}
        <div className="p-4 shadow-[0_-2px_8px_rgba(0,0,0,0.1)] bg-white dark:bg-zinc-900 shrink-0">
            <Button 
                onClick={handleSubmit} 
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold shadow-md flex justify-between"
            >
                <span>Salvar</span>
                <CircleCheckBig className="h-6 w-6" />
            </Button>
        </div>
    </SheetContent>
</Sheet>
```

### Auto-Scroll para Campos Condicionais (Mobile)

Quando um campo aparece condicionalmente em mobile (ex: selecionar "Diluível" mostra campo "Proporção"), implemente auto-scroll:

```tsx
const fieldRef = useRef<HTMLDivElement>(null);

useEffect(() => {
    if (isMobile && condition && fieldRef.current) {
        setTimeout(() => {
            fieldRef.current?.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest' 
            });
        }, 100); // Delay para aguardar animação
    }
}, [condition, isMobile]);

// No JSX
{condition && (
    <div ref={fieldRef}>
        {/* Campo condicional */}
    </div>
)}
```

## Componentes de UI

### Filtros Ativos (ActiveFilters) (Pode ser usado em Sheets ou Pages)

Veja a documentação de `src/components/ui/active-filters.tsx` para detalhes.

### Paginação (TablePagination)

Use `TablePagination` para tabelas com > 25 itens.

### Click-to-Edit

Em tabelas, o clique na linha deve abrir o Sheet de edição. Use `e.stopPropagation()` em botões de ação dentro da linha.

### Campos Opcionais (Toggle Pattern)

Para formulários com muitos campos opcionais, use botões de "toggle" para exibir/ocultar esses campos, mantendo o formulário limpo.

- **UI**: Botões pequenos (badge-like) com ícone `+` (ex: `+ Descrição`, `+ Foto`).
- **Comportamento**: Ao clicar, o botão muda para `-` ou muda de cor (ex: cinza escuro) e o campo aparece logo abaixo ou em uma seção dedicada.
- **Botões de Seleção**: Para campos como "Tipo de Produto", use grupos de botões grandes e visuais em vez de Radio Buttons nativos.

Exemplo de estrutura visual dos botões de opção:
```tsx
<div className="flex flex-wrap gap-2 mb-4">
    <Button 
        variant={showDescription ? "secondary" : "outline"} 
        onClick={() => setShowDescription(!showDescription)}
        size="sm"
    >
        {showDescription ? <Minus /> : <Plus />} Descrição
    </Button>
    {/* Outros botões */}
</div>

{showDescription && (
    <div className="animate-in fade-in slide-in-from-top-2">
       {/* Input do campo */}
    </div>
)}
```

## Stack Tecnológica
- **Estilização:** Tailwind CSS (use variáveis do tema `index.css`).
- **Componentes:** Shadcn/UI (baseado em Radix UI).
- **Ícones:** Lucide React.
- **Feedback:** Use `sonner` para Toasts.

