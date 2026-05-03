import { Loader3 } from "./ui/loader-3";
import type { AppLanguage } from "../types/language";
import { languageLabels } from "../types/language";
import { uiText } from "../utils/i18n";

type Props = {
  language: AppLanguage;
};

export default function LanguageRefreshOverlay({ language }: Props) {
  return (
    <div className="language-refresh-overlay" role="status" aria-live="polite">
      <div className="language-refresh-card">
        <Loader3 />
        <p>{uiText(language, "refreshingLanguage")}</p>
        <strong>{languageLabels[language]}</strong>
      </div>
    </div>
  );
}
