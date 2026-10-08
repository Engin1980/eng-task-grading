import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES } from "../../i18n";

const LanguageSwitcher: React.FC = () => {
  const { t, i18n } = useTranslation();
  const current = i18n.resolvedLanguage;

  return (
    <div className="flex items-center gap-1 text-xs" role="group" aria-label={t("language")}>
      {SUPPORTED_LANGUAGES.map((lng) => (
        <button
          key={lng}
          type="button"
          title={t(`languageName.${lng}`)}
          aria-pressed={current === lng}
          onClick={() => i18n.changeLanguage(lng)}
          className={`px-2 py-1 rounded cursor-pointer uppercase ${
            current === lng ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {lng}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
