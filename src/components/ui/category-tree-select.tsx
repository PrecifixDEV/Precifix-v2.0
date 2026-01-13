"use client"

import * as React from "react"
import { Check, ChevronsUpDown, ChevronRight, ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

export interface CategoryNode {
    id: string
    label: string
    subcategories?: CategoryNode[]
}

interface CategoryTreeSelectProps {
    data: CategoryNode[]
    value?: string // ID of the selected subcategory
    onSelect: (value: string) => void
    placeholder?: string
}

export function CategoryTreeSelect({
    data,
    value,
    onSelect,
    placeholder = "Selecione uma categoria..."
}: CategoryTreeSelectProps) {
    const [open, setOpen] = React.useState(false)
    const [searchTerm, setSearchTerm] = React.useState("")
    const [expandedParents, setExpandedParents] = React.useState<Record<string, boolean>>({})

    // Flatten logic for search
    const hasSearch = searchTerm.length > 0

    // Toggle expansion
    const toggleExpand = (id: string, e: React.MouseEvent) => {
        e.stopPropagation() // Prevent selection
        e.preventDefault()
        setExpandedParents(prev => ({
            ...prev,
            [id]: !prev[id]
        }))
    }

    // Find selected label
    const getSelectedLabel = () => {
        if (!value) return null

        for (const parent of data) {
            if (parent.subcategories) {
                const found = parent.subcategories.find(c => c.id === value || c.label === value) // Checking label too for backward compat if ID logic changes
                if (found) return found.label
            }
        }
        return value // Fallback
    }

    // Filter logic
    // Filter logic
    // The filter logic was previously here but was unused as renderSearchResults handles it.


    // Specific render for flat search results
    const renderSearchResults = () => {
        const results: { id: string, label: string, path: string }[] = []
        const lowerTerm = searchTerm.toLowerCase()

        data.forEach(parent => {
            if (parent.subcategories) {
                parent.subcategories.forEach(sub => {
                    if (sub.label.toLowerCase().includes(lowerTerm)) {
                        results.push({
                            id: sub.id,
                            label: sub.label,
                            path: `${parent.label} > ${sub.label}`
                        })
                    }
                })
            }
        })

        if (results.length === 0) return <CommandEmpty>Nenhuma categoria encontrada.</CommandEmpty>

        return (
            <CommandGroup heading="Resultados">
                {results.map(item => (
                    <CommandItem
                        key={item.id}
                        value={`${item.id}-${item.label}`} // Unique value for command
                        onSelect={() => {
                            onSelect(item.label) // We return Label as "ID" currently based on old app logic, or actual ID?
                            // The app uses Name (String) as ID in many places. 
                            // Let's assume we pass what the app expects.
                            // The user said "value: string". 
                            // In ManageCosts, we pass `cat` which seems to be the name string.
                            setOpen(false)
                            setSearchTerm("")
                        }}
                    >
                        <Check
                            className={cn(
                                "mr-2 h-4 w-4",
                                value === item.label ? "opacity-100" : "opacity-0"
                            )}
                        />
                        <div className="flex flex-col">
                            <span>{item.label}</span>
                            <span className="text-xs text-muted-foreground">{item.path}</span>
                        </div>
                    </CommandItem>
                ))}
            </CommandGroup>
        )
    }

    const renderTree = () => {
        return (
            <>
                <CommandEmpty>Nenhuma categoria encontrada.</CommandEmpty>
                {data.map(parent => (
                    <React.Fragment key={parent.id}>
                        {/* Parent Node (Not Selectable, acts as Accordion Trigger) */}
                        <div
                            className="flex items-center px-2 py-1.5 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer select-none group"
                            onClick={(e) => toggleExpand(parent.id, e)}
                        >
                            <span className="mr-2 h-4 w-4 flex items-center justify-center text-muted-foreground">
                                {expandedParents[parent.id] ? (
                                    <ChevronDown className="h-4 w-4" />
                                ) : (
                                    <ChevronRight className="h-4 w-4" />
                                )}
                            </span>
                            {parent.label}
                        </div>

                        {/* Children Nodes */}
                        {expandedParents[parent.id] && parent.subcategories && (
                            <CommandGroup className="pl-6 border-l ml-3 my-1">
                                {parent.subcategories.map(child => (
                                    <CommandItem
                                        key={child.id}
                                        value={child.label} // Command uses this for filtering internally, but we handle filter manually? 
                                        // Actually Command component has internal filtering.
                                        // If we control state, we might fight with it.
                                        // Better: Only show renderTree if !hasSearch.
                                        onSelect={() => {
                                            onSelect(child.label) // Return label/name as expected by current backend
                                            setOpen(false)
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value === child.label ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {child.label}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                    </React.Fragment>
                ))}
            </>
        )
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between font-normal"
                >
                    {getSelectedLabel() || placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
                <Command shouldFilter={false}> {/* We handle filtering manually to swap views */}
                    <CommandInput
                        placeholder="Buscar categoria..."
                        value={searchTerm}
                        onValueChange={setSearchTerm}
                    />
                    <CommandList>
                        {hasSearch ? renderSearchResults() : renderTree()}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
