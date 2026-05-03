import { Loader3 } from "./ui/loader-3";
import type { AppLanguage } from "../types/language";
import { languageLabels } from "../types/language";
import { uiText } from "../utils/i18n";

type Props = {
  language: AppLanguage;
  message?: string;
  label?: string;
};

export default function LanguageRefreshOverlay({ language, message, label }: Props) {
  return (
    <div className="language-refresh-overlay" role="status" aria-live="polite">
      <div className="language-refresh-card">
        <Loader3 />
        <p>{message ?? uiText(language, "refreshingLanguage")}</p>
        <strong>{label ?? languageLabels[language]}</strong>
      </div>
    </div>
  );
}
