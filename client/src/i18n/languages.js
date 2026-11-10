export const SUPPORTED_LANGUAGES = ['fr', 'en', 'es', 'de', 'zh', 'ru'];

export const LANGUAGE_OPTIONS = [
    { code: 'fr', nativeLabel: 'Français' },
    { code: 'en', nativeLabel: 'English' },
    { code: 'es', nativeLabel: 'Español' },
    { code: 'de', nativeLabel: 'Deutsch' },
    { code: 'zh', nativeLabel: '中文' },
    { code: 'ru', nativeLabel: 'Русский' },
];

export const DEFAULT_LANGUAGE = 'fr';

export function isSupportedLanguage(code) {
    return SUPPORTED_LANGUAGES.includes(code);
}

export function normalizeLanguage(code) {
    if (typeof code !== 'string') {
        return DEFAULT_LANGUAGE;
    }
    const short = code.trim().toLowerCase().slice(0, 2);
    return isSupportedLanguage(short) ? short : DEFAULT_LANGUAGE;
}

export function detectBrowserLanguage() {
    const candidates = [
        ...(Array.isArray(navigator.languages) ? navigator.languages : []),
        navigator.language,
    ].filter(Boolean);

    for (const candidate of candidates) {
        const normalized = normalizeLanguage(candidate);
        if (isSupportedLanguage(normalized) && candidate.toLowerCase().startsWith(normalized)) {
            return normalized;
        }
    }
    return DEFAULT_LANGUAGE;
}

export function htmlLangFor(code) {
    const normalized = normalizeLanguage(code);
    if (normalized === 'zh') {
        return 'zh-CN';
    }
    return normalized;
}
