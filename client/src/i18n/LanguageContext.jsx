import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { STORAGE_KEYS, getStorageItem, setStorageItem } from '../utils/storage.js';
import {
    DEFAULT_LANGUAGE,
    LANGUAGE_OPTIONS,
    detectBrowserLanguage,
    htmlLangFor,
    isSupportedLanguage,
    normalizeLanguage,
} from './languages.js';
import { translate } from './translations.js';

const LanguageContext = createContext(null);

function getInitialLanguage() {
    const stored = getStorageItem(STORAGE_KEYS.language);
    if (stored && isSupportedLanguage(normalizeLanguage(stored))) {
        return normalizeLanguage(stored);
    }
    return detectBrowserLanguage();
}

export function LanguageProvider({ children }) {
    const [language, setLanguageState] = useState(getInitialLanguage);

    const setLanguage = useCallback((code) => {
        const next = normalizeLanguage(code);
        setLanguageState(next);
        setStorageItem(STORAGE_KEYS.language, next);
        document.documentElement.lang = htmlLangFor(next);
    }, []);

    useEffect(() => {
        document.documentElement.lang = htmlLangFor(language);
    }, [language]);

    const t = useCallback(
        (key, vars) => translate(language, key, vars),
        [language]
    );

    const value = useMemo(
        () => ({
            language,
            setLanguage,
            t,
            languages: LANGUAGE_OPTIONS,
        }),
        [language, setLanguage, t]
    );

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
}

export { DEFAULT_LANGUAGE, normalizeLanguage };
