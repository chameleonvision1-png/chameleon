"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, SyncLang } from "./sync-i18n";
import { SyncAuthProvider } from "./SyncAuthProvider";
import { SyncCartProvider } from "./SyncCartProvider";

type Theme = "sync-dark" | "sync-light";

interface SyncContextType {
  lang: SyncLang;
  setLang: (lang: SyncLang) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  t: typeof translations.en;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export function SyncProviders({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<SyncLang>("en");
  const [theme, setThemeState] = useState<Theme>("sync-dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem("sync-lang") as SyncLang;
    if (savedLang === "en" || savedLang === "ar") {
      setLangState(savedLang);
    }
    
    const savedTheme = localStorage.getItem("sync-theme") as Theme;
    if (savedTheme === "sync-dark" || savedTheme === "sync-light") {
      setThemeState(savedTheme);
    }
    setMounted(true);
  }, []);

  const setLang = (newLang: SyncLang) => {
    setLangState(newLang);
    localStorage.setItem("sync-lang", newLang);
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("sync-theme", newTheme);
  };

  const t = translations[lang];

  // Prevent hydration mismatch by not rendering the wrapper until mounted,
  // or rendering it with default theme. Defaulting to sync-dark is fine since it's the default.
  
  return (
    <SyncContext.Provider value={{ lang, setLang, theme, setTheme, t }}>
      <SyncAuthProvider>
        <SyncCartProvider>
          <div 
            data-theme={theme} 
            className={`sync-wrapper w-full h-full font-sans ${lang === 'ar' ? 'text-right' : 'text-left'}`} 
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
          >
            {children}
          </div>
        </SyncCartProvider>
      </SyncAuthProvider>
    </SyncContext.Provider>
  );
}

export function useSync() {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error("useSync must be used within a SyncProviders");
  }
  return context;
}
