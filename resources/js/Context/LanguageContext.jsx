import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import { getTranslation } from '../translations';

const LanguageContext = createContext({
    locale: 'ar',
    isRTL: true,
    t: (key, params) => key,
    setLocale: () => {},
    toggleLocale: () => {},
});

export function LanguageProvider({ children }) {
    const [locale, setLocaleState] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('twenty_locale') || 'ar';
        }
        return 'ar';
    });

    const isTransitioning = useRef(false);

    useEffect(() => {
        if (typeof document !== 'undefined') {
            document.documentElement.lang = locale;
            document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
            localStorage.setItem('twenty_locale', locale);
        }
    }, [locale]);

    const setLocale = (newLocale) => {
        setLocaleState(newLocale);
    };

    const toggleLocale = (e) => {
        if (isTransitioning.current) return;

        const nextLocale = locale === 'ar' ? 'en' : 'ar';

        const applyLocale = () => {
            document.documentElement.lang = nextLocale;
            document.documentElement.dir = nextLocale === 'ar' ? 'rtl' : 'ltr';
            localStorage.setItem('twenty_locale', nextLocale);
            setLocaleState(nextLocale);
        };

        // Fallback for browsers without View Transitions API or if user prefers reduced motion
        if (
            !document.startViewTransition ||
            window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ) {
            applyLocale();
            return;
        }

        isTransitioning.current = true;

        // Origin of the expanding circle (click coordinates or center of toggle button)
        const rect = e?.currentTarget?.getBoundingClientRect();
        const x = e?.clientX ?? (rect ? rect.left + rect.width / 2 : window.innerWidth / 2);
        const y = e?.clientY ?? (rect ? rect.top + rect.height / 2 : window.innerHeight / 2);

        // Calculate radius to the furthest corner of the viewport
        const endRadius = Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y)
        );

        const transition = document.startViewTransition(() => {
            flushSync(() => {
                applyLocale();
            });
        });

        transition.ready.then(() => {
            document.documentElement.animate(
                {
                    clipPath: [
                        `circle(0px at ${x}px ${y}px)`,
                        `circle(${endRadius}px at ${x}px ${y}px)`,
                    ],
                },
                {
                    duration: 600,
                    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                    pseudoElement: '::view-transition-new(root)',
                }
            );
        });

        transition.finished.finally(() => {
            isTransitioning.current = false;
        });
    };

    const t = (key, params = {}) => {
        return getTranslation(locale, key, params);
    };

    const isRTL = locale === 'ar';

    return (
        <LanguageContext.Provider value={{ locale, isRTL, t, setLocale, toggleLocale }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useTranslation() {
    return useContext(LanguageContext);
}
