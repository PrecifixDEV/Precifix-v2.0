import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  X,
  ChevronDown,
} from 'lucide-react';
import { useSidebar } from './SidebarContext';
import { Button } from '@/components/ui/button';
import { navigationLinks as defaultNavigationLinks } from '@/lib/navigation';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from '@/lib/utils';
import { useDrag, useDrop } from 'react-dnd';
import { useSession } from '@/components/SessionContextProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Tipo para o item arrastável
const SIDEBAR_ITEM_TYPE = 'SIDEBAR_ITEM';

interface DragItem {
  index: number;
  id: string;
  type: string;
}

interface SidebarItemProps {
  link: any;
  index: number;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
  onDrop: () => void;
  location: any;
  closeSidebar: () => void;
  openGroups: Record<string, boolean>;
  toggleGroup: (label: string) => void;
}

const SidebarItem = ({ link, index, moveItem, onDrop, location, closeSidebar, openGroups, toggleGroup }: SidebarItemProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: string | symbol | null }>({
    accept: SIDEBAR_ITEM_TYPE,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = (clientOffset as any).y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      moveItem(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
    drop() {
        onDrop();
    }
  });

  const [{ isDragging }, drag] = useDrag({
    type: SIDEBAR_ITEM_TYPE,
    item: () => {
      return { id: link.label, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
        // Optional: handle end of drag if needed differently from drop
        // But drop on target triggers onDrop in useDrop
        // If dropped outside, we might want to revert? But here we mutate state live.
        if (monitor.didDrop()) {
            onDrop();
        }
    }
  });

  drag(drop(ref));

  const opacity = isDragging ? 0 : 1;

  // Render logic copied from original Sidebar
  if (link.type === 'link') {
    const isActive = location.pathname === link.to;
    return (
      <div ref={ref} style={{ opacity }} data-handler-id={handlerId}>
        <Link
          to={link.to}
          onClick={closeSidebar}
          className={`relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors cursor-move ${
            isActive
              ? 'bg-background text-sidebar-foreground font-bold shadow-sm border-l-4 border-primary pl-[calc(0.75rem-4px)]'
              : 'text-sidebar-foreground font-normal hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:font-bold'
          }`}
        >
          <link.icon className="h-4 w-4" />
          {link.label}
        </Link>
      </div>
    );
  }

  if (link.type === 'group') {
    const Icon = link.icon;
    const isOpen = openGroups[link.label] || false;
    const isGroupActive = link.sublinks.some((sub: any) => sub.to === location.pathname);

    return (
      <div ref={ref} style={{ opacity }} data-handler-id={handlerId}>
        <Collapsible 
          open={isOpen} 
          onOpenChange={() => toggleGroup(link.label)}
          className="space-y-1"
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-start px-3 py-2 text-sm font-medium transition-colors h-auto cursor-move',
                isGroupActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-bold'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:font-bold'
              )}
            >
              <Icon className="h-4 w-4 mr-3" />
              <span className="flex-1 text-left">{link.label}</span>
              <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen ? 'rotate-180' : 'rotate-0')} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 pl-4">
            {link.sublinks.map((sublink: any) => {
              const isActive = location.pathname === sublink.to;
              return (
                <Link
                  key={sublink.to}
                  to={sublink.to}
                  onClick={closeSidebar}
                  className={`relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? 'bg-background text-sidebar-foreground font-bold shadow-sm border-l-4 border-primary pl-[calc(0.75rem-4px)]'
                      : 'text-sidebar-foreground font-normal hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:font-bold'
                  }`}
                >
                  <sublink.icon className="h-4 w-4" />
                  {sublink.label}
                </Link>
              );
            })}
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  }
  return null;
};

export const Sidebar = () => {
  const { isSidebarOpen, closeSidebar } = useSidebar();
  const location = useLocation();
  const { user } = useSession();
  const { toast } = useToast();
  
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [links, setLinks] = useState(defaultNavigationLinks);

  // Carregar ordem salva
  useEffect(() => {
    if (user) {
      const fetchOrder = async () => {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('preference_value')
          .eq('user_id', user.id)
          .eq('preference_key', 'sidebar_order')
          .single();

        if (data?.preference_value?.order) {
          const savedOrder = data.preference_value.order as string[];
          const newLinks = [...defaultNavigationLinks].sort((a, b) => {
            const indexA = savedOrder.indexOf(a.label);
            const indexB = savedOrder.indexOf(b.label);
            // Se ambos existirem na ordem salva, ordena por ela
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            // Se apenas um existir, coloca o existente antes
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            // Se nenhum existir, mantém a ordem original
            return 0;
          });
          setLinks(newLinks);
        }
      };
      fetchOrder();
    }
  }, [user]);

  // Efeito para abrir o grupo ativo ao carregar
  useEffect(() => {
    const activeGroup = links.find(link => 
      link.type === 'group' && link.sublinks?.some((sub: any) => sub.to === location.pathname)
    );
    if (activeGroup && activeGroup.label) {
      setOpenGroups(prev => ({ ...prev, [activeGroup.label]: true }));
    }
  }, [location.pathname, links]);

  const toggleGroup = (label: string) => {
    setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const moveItem = (dragIndex: number, hoverIndex: number) => {
    const dragItem = links[dragIndex];
    const newLinks = [...links];
    newLinks.splice(dragIndex, 1);
    newLinks.splice(hoverIndex, 0, dragItem);
    setLinks(newLinks);
  };

  const persistOrder = async () => {
    if (!user) return;
    const order = links.map(link => link.label);
    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        preference_key: 'sidebar_order',
        preference_value: { order }
      }, { onConflict: 'user_id, preference_key' });

    if (error) {
      console.error('Error saving sidebar order:', error);
      toast({
        title: "Erro ao salvar ordem",
        description: "Não foi possível salvar a ordem do menu.",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      {/* Overlay para mobile */}
      {isSidebarOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 z-20 bg-black opacity-50 lg:hidden"
        ></div>
      )}

      {/* Sidebar principal */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 overflow-y-auto bg-sidebar transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col`}
      >
        <div className="flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3" onClick={closeSidebar}>
            <img 
              src="/precifix-logo.png" 
              alt="Precifix Logo" 
              className="h-10 w-auto"
            />
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={closeSidebar}
            className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {links.map((link, index) => (
            <SidebarItem
              key={link.label}
              index={index}
              link={link}
              moveItem={moveItem}
              onDrop={persistOrder}
              location={location}
              closeSidebar={closeSidebar}
              openGroups={openGroups}
              toggleGroup={toggleGroup}
            />
          ))}
        </nav>

        <div className="mt-auto px-6 py-4 border-t border-sidebar-border text-xs text-sidebar-foreground/70">
          <p>&copy; {new Date().getFullYear()} Precifix. Todos os direitos reservados.</p>
        </div>
      </aside>
    </>
  );
};