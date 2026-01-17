import { type ReactNode } from "react";
import { TopHeader } from "./TopHeader";
import { BottomNav } from "./BottomNav";

interface AppLayoutProps {
    children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <TopHeader />

            {/* Padding Top = Altura do Header (16 = 4rem = 64px) */}
            {/* Padding Bottom = Altura da Nav (80px) + Extra para respiro */}
            <main className="pt-20 pb-28 px-4 max-w-md mx-auto w-full">
                {children}
            </main>

            <BottomNav />
        </div>
    );
}
