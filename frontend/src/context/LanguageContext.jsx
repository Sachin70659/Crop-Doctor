import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { translations, getTranslation } from "../translations";

const LanguageContext = createContext(null);

const STORAGE_KEY = "crop_doctor_lang";

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "hi" || saved === "en") return saved;
      // Default to Hindi if browser language indicates Hindi, otherwise English
      if (typeof navigator !== "undefined" && navigator.language?.toLowerCase().startsWith("hi")) {
        return "hi";
      }
    } catch {
      // Storage access error fallback
    }
    return "en";
  });

  const setLanguage = useCallback((lang) => {
    const valid = lang === "hi" ? "hi" : "en";
    setLanguageState(valid);
    try {
      localStorage.setItem(STORAGE_KEY, valid);
    } catch {
      // Ignore storage errors
    }
    if (typeof document !== "undefined") {
      document.documentElement.lang = valid;
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === "en" ? "hi" : "en");
  }, [language, setLanguage]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
    }
  }, [language]);

  const t = useCallback(
    (keyPath, fallback = "") => {
      return getTranslation(language, keyPath, fallback);
    },
    [language]
  );

  const isHindi = language === "hi";

  const currentStrings = useMemo(() => {
    return translations[language] || translations.en;
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t,
      isHindi,
      strings: currentStrings
    }),
    [language, setLanguage, toggleLanguage, t, isHindi, currentStrings]
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
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
