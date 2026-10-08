import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { cs } from "./locales/cs";
import { en } from "./locales/en";

export const SUPPORTED_LANGUAGES = ["cs", "en"] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];
export const DEFAULT_LANGUAGE: AppLanguage = "cs";
export const LANGUAGE_STORAGE_KEY = "app.lang";

export const defaultNS = "common";
export const resources = { cs, en } as const;

/** Czech/Slovak browser languages -> cs, anything else -> en. */
function toSupportedLanguage(lng: string): AppLanguage {
  const l = lng.toLowerCase();
  return l.startsWith("cs") || l.startsWith("sk") ? "cs" : "en";
}

function applyDocumentLanguage(lng: string) {
  document.documentElement.lang = toSupportedLanguage(lng);
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    defaultNS,
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: SUPPORTED_LANGUAGES,
    nonExplicitSupportedLngs: true,
    load: "languageOnly",
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
      caches: ["localStorage"],
      convertDetectedLanguage: toSupportedLanguage,
    },
  });

applyDocumentLanguage(i18n.resolvedLanguage ?? DEFAULT_LANGUAGE);
i18n.on("languageChanged", applyDocumentLanguage);

export default i18n;
