"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '@/i18n/translations';

type Language = 'en' | 'hi' | 'mr';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (section: keyof typeof translations.en, key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>('en');

    useEffect(() => {
        const savedLang = localStorage.getItem('sushrusha_lang') as Language;
        if (savedLang && (savedLang === 'en' || savedLang === 'hi' || savedLang === 'mr')) {
            setLanguage(savedLang);
        }
    }, []);

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem('sushrusha_lang', lang);
    };

    const t = (section: keyof typeof translations.en, key: string) => {
        // Fallback to English if translation is missing
        const sectionMap = translations[language][section] as any;
        if (sectionMap && sectionMap[key]) {
            return sectionMap[key];
        }
        const fallbackMap = translations['en'][section] as any;
        return fallbackMap ? (fallbackMap[key] || key) : key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
