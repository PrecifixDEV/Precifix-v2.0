import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { SidebarProvider } from './SidebarContext';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <DndProvider backend={HTML5Backend}>
      <SidebarProvider>
        <div className="flex h-screen bg-background">
          {/* Sidebar para desktop e mobile (controlada pelo contexto) */}
          <Sidebar />

          <div className="flex flex-col flex-1 w-full overflow-y-auto">
            {/* Header do Dashboard */}
            <Header />

            {/* Conteúdo principal da página */}
            <main className="h-full overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </DndProvider>
  );
};