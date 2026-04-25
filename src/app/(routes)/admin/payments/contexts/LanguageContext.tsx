'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import enTranslations from '../locales/en.json';

type Translations = typeof enTranslations;

interface LanguageContextType {
  t: (key: string) => string;
  translations: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: unknown = enTranslations;

    for (const k of keys) {
      if (typeof value === 'object' && value !== null && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        value = undefined;
        break;
      }
    }

    if (typeof value !== 'string') {
      console.warn(`Missing translation for key: ${key}`);
      return '';
    }

    return value;
  };

  const value: LanguageContextType = {
    t,
    translations: enTranslations,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
