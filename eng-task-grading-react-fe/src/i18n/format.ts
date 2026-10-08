import { useTranslation } from "react-i18next";
import i18n from "./index";

const localeOf = (lng?: string) => ((lng ?? i18n.resolvedLanguage) === "en" ? "en-GB" : "cs-CZ");

type DateInput = Date | string | number;
const toDate = (v: DateInput) => (v instanceof Date ? v : new Date(v));

/** Formatters usable outside React components (read the current language at call time). */
export const formatDate = (v: DateInput, lng?: string) => toDate(v).toLocaleDateString(localeOf(lng));
export const formatDateTime = (v: DateInput, lng?: string) => toDate(v).toLocaleString(localeOf(lng));
export const formatNumber = (v: number, options?: Intl.NumberFormatOptions, lng?: string) =>
  v.toLocaleString(localeOf(lng), options);

/** Hook variant: re-renders the component when the language changes. */
export function useFormatters() {
  const { i18n: inst } = useTranslation();
  const lng = inst.resolvedLanguage;
  return {
    formatDate: (v: DateInput) => formatDate(v, lng),
    formatDateTime: (v: DateInput) => formatDateTime(v, lng),
    formatNumber: (v: number, options?: Intl.NumberFormatOptions) => formatNumber(v, options, lng),
  };
}
