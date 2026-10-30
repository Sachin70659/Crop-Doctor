import { en } from "./en";
import { hi } from "./hi";

export const translations = {
  en,
  hi,
};

export function getTranslation(lang, path, fallback = "") {
  const dictionary = translations[lang] || translations.en;
  const keys = path.split(".");
  let current = dictionary;

  for (const key of keys) {
    if (current && typeof current === "object" && key in current) {
      current = current[key];
    } else {
      // Fallback to English dictionary if key missing in selected language
      let fallbackCurrent = translations.en;
      for (const fbKey of keys) {
        if (fallbackCurrent && typeof fallbackCurrent === "object" && fbKey in fallbackCurrent) {
          fallbackCurrent = fallbackCurrent[fbKey];
        } else {
          return fallback || path;
        }
      }
      return fallbackCurrent || fallback || path;
    }
  }

  return current !== undefined ? current : fallback || path;
}
