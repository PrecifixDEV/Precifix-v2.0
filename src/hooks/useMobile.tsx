import { useEffect, useState } from 'react';

/**
 * Hook para detectar se o dispositivo é mobile
 * @param breakpoint - Largura máxima em pixels para considerar mobile (padrão: 768px)
 * @returns true se a largura da tela for menor ou igual ao breakpoint
 */
export function useMobile(breakpoint = 768) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const query = `(max-width: ${breakpoint}px)`;
        const mediaQuery = window.matchMedia(query);

        // Define o valor inicial
        setIsMobile(mediaQuery.matches);

        // Listener para mudanças
        const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
        mediaQuery.addEventListener('change', handler);

        // Cleanup
        return () => mediaQuery.removeEventListener('change', handler);
    }, [breakpoint]);

    return isMobile;
}
