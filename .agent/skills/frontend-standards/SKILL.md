---
name: frontend-standards
description: Padrões de UI/UX, responsividade e componentes para o Precifix.
---

# Padrões de Frontend do Precifix
# Frontend Standards - Precifix

## Responsividade

### Entrada de Dados (Formulários)

**Form Dialogs (Criação/Edição)**: Formulários modais para criar ou editar itens (ex: "Novo Produto", "Editar Cliente") devem usar:
- **Mobile (< 768px)**: `<Drawer>` com footer empilhado verticalmente
- **Desktop (≥ 768px)**: `<Dialog>` com footer horizontal

**Páginas Completas**: Páginas como "Meu Perfil" ou "Configurações" devem permanecer como páginas normais, NÃO usar Drawer/Dialog.

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

### Filtros Ativos (ActiveFilters)

Use o componente `ActiveFilters` para exibir filtros aplicados:

```tsx
import { ActiveFilters } from '@/components/ui/active-filters';

// No componente
{filterType !== 'all' && (
    <ActiveFilters
        filters={[
            { label: 'Nome do Filtro' },
            { label: 'Outro Filtro', value: 'Valor' } // opcional
        ]}
        onClearAll={() => setFilterType('all')}
    />
)}
```

**Comportamento**:
- **Desktop**: Botão mostra "X Limpar Filtros"
- **Mobile**: Botão mostra apenas "X" (economiza espaço)
- Badges com fundo cinza claro/escuro
- Borda inferior para separação visual

## Componentes de Tabela

### Paginação (TablePagination)

Use `TablePagination` para tabelas com > 25 itens:

```tsx
import { TablePagination } from '@/components/ui/table-pagination';

const [currentPage, setCurrentPage] = useState(1);
const ITEMS_PER_PAGE = 25;

// Lógica de paginação
const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
);

// Reset ao filtrar
useEffect(() => {
    setCurrentPage(1);
}, [searchTerm, filterType]);

// Componente
<TablePagination
    currentPage={currentPage}
    totalPages={totalPages}
    onPageChange={setCurrentPage}
    totalItems={filteredItems.length}
    itemsPerPage={ITEMS_PER_PAGE}
/>
```

**Comportamento**:
- **Desktop**: Controles completos (Primeira | Anterior | Dropdown | Próxima | Última)
- **Mobile**: Apenas setas `< >`
- Auto-hide quando total ≤ 25 itens

### Click-to-Edit em Tabelas

Implemente click na linha para editar com `stopPropagation` em elementos interativos:

```tsx
<TableRow 
    onClick={() => handleEdit(item)}
    className="hover:bg-slate-50 cursor-pointer"
>
    <TableCell onClick={(e) => e.stopPropagation()}>
        <Checkbox ... />
    </TableCell>
    {/* campos normais */}
    <TableCell onClick={(e) => e.stopPropagation()}>
        <DropdownMenu ... />
    </TableCell>
</TableRow>
```
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
