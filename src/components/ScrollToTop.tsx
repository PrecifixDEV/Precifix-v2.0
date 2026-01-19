import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Component responsible for scrolling the window to the top
 * whenever the route changes.
 */
export function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}
