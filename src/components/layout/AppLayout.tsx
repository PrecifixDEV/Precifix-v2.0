import { type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { TopHeader } from "./TopHeader";
import { BottomNav } from "./BottomNav";

interface AppLayoutProps {
    children: ReactNode;
}

const ROOT_PATHS = ['/', '/menu', '/sales', '/profile', '/profile-menu'];

export function AppLayout({ children }: AppLayoutProps) {
    const location = useLocation();
    const showBottomNav = ROOT_PATHS.includes(location.pathname);

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            <TopHeader />

            {/* Padding Top = Altura do Header (16 = 4rem = 64px) */}
            {/* Padding Bottom dinamico dependendo se a nav está visivel ou nao */}
            <main className={`pt-20 px-4 max-w-md mx-auto w-full transition-all duration-300 ${showBottomNav ? 'pb-28' : 'pb-8'}`}>
                {children}
            </main>

            <div className={`fixed bottom-0 left-0 right-0 z-40 transition-transform duration-300 ease-in-out ${showBottomNav ? 'translate-y-0' : 'translate-y-[150%]'}`}>
                <BottomNav />
            </div>
        </div>
    );
}
