"use client"

import * as React from "react"
import { Check, ChevronsUpDown, ChevronRight, ChevronDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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
                const found = parent.subcategories.find(c => c.id === value || c.label === value)
                if (found) return found.label
            }
        }
        return value // Fallback
    }

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

        if (results.length === 0) {
            return (
                <div className="py-6 text-center text-sm text-muted-foreground">
                    Nenhuma categoria encontrada.
                </div>
            )
        }

        return (
            <div className="py-2">
                <div className="px-2 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-widest px-3">Resultados</div>
                {results.map(item => (
                    <div
                        key={item.id}
                        className={cn(
                            "relative flex cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors",
                            value === item.label && "bg-zinc-100 dark:bg-zinc-800"
                        )}
                        onClick={() => {
                            onSelect(item.label)
                            setOpen(false)
                            setSearchTerm("")
                        }}
                    >
                        <Check
                            className={cn(
                                "mr-2 h-4 w-4 shrink-0",
                                value === item.label ? "opacity-100" : "opacity-0"
                            )}
                        />
                        <div className="flex flex-col overflow-hidden">
                            <span className="truncate">{item.label}</span>
                            <span className="text-xs text-muted-foreground truncate">{item.path}</span>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    const renderTree = () => {
        if (data.length === 0) {
            return (
                <div className="py-6 text-center text-sm text-muted-foreground">
                    Lista vazia.
                </div>
            )
        }

        return (
            <div className="py-1">
                {data.map(parent => (
                    <React.Fragment key={parent.id}>
                        {/* Parent Node */}
                        <div
                            className="flex items-center px-3 py-2 text-sm font-medium text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer select-none group transition-colors"
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
                            <div className="pl-6 border-l border-zinc-100 dark:border-zinc-800 ml-4 my-1 flex flex-col gap-1">
                                {parent.subcategories.map(child => (
                                    <div
                                        key={child.id}
                                        className={cn(
                                            "relative flex cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors",
                                            value === child.label && "bg-zinc-100 dark:bg-zinc-800"
                                        )}
                                        onClick={() => {
                                            onSelect(child.label)
                                            setOpen(false)
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4 shrink-0",
                                                value === child.label ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        <span className="truncate">{child.label}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        )
    }

    return (
        <Popover open={open} onOpenChange={setOpen} modal={false}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    className={cn(
                        "flex h-10 w-full rounded-md border border-input bg-background dark:bg-zinc-950 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                        "justify-between font-normal hover:bg-zinc-800/50 text-foreground"
                    )}
                >
                    {getSelectedLabel() || placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-[320px] p-0 z-[200] overflow-hidden shadow-2xl rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                align="start"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <div className="flex flex-col h-full max-h-[400px]">
                    <div className="flex items-center border-b px-3 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50 text-muted-foreground" />
                        <input
                            placeholder="Buscar categoria..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
                        />
                    </div>
                    <div
                        className="max-h-[350px] overflow-y-auto overscroll-contain custom-scrollbar py-1"
                        onPointerDown={(e) => e.stopPropagation()}
                    >
                        {hasSearch ? renderSearchResults() : renderTree()}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
