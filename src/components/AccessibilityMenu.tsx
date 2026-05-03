import { useState } from "react";
import type { AppLanguage } from "../types/language";
import { uiText } from "../utils/i18n";

type AccessibilityMenuProps = {
  settings: {
    highContrast: boolean;
    largeText: boolean;
    colourBlindSafe: boolean;
  };
  onToggle: (key: "highContrast" | "largeText" | "colourBlindSafe") => void;
  language: AppLanguage;
};

export default function AccessibilityMenu({ settings, onToggle, language }: AccessibilityMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="accessibility-trigger"
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <span aria-hidden="true">A11y</span>
        <span>{uiText(language, "accessibility")}</span>
      </button>

      {isOpen && (
        <>
          <button className="accessibility-backdrop" aria-label="Close accessibility menu" onClick={() => setIsOpen(false)} type="button" />
          <div className="accessibility-popover" role="dialog" aria-label={uiText(language, "accessibilityOptions")}>
            <h3>{uiText(language, "accessibilityOptions")}</h3>
            <div className="accessibility-options">
              <AccessibilityToggle
                label={uiText(language, "highContrast")}
                active={settings.highContrast}
                onClick={() => onToggle("highContrast")}
                description={uiText(language, "highContrastDesc")}
              />
              <AccessibilityToggle
                label={uiText(language, "largerText")}
                active={settings.largeText}
                onClick={() => onToggle("largeText")}
                description={uiText(language, "largerTextDesc")}
              />
              <AccessibilityToggle
                label={uiText(language, "colourBlind")}
                active={settings.colourBlindSafe}
                onClick={() => onToggle("colourBlindSafe")}
                description={uiText(language, "colourBlindDesc")}
              />
            </div>
            <p>{uiText(language, "accessibilityNote")}</p>
          </div>
        </>
      )}
    </div>
  );
}

function AccessibilityToggle({ label, active, onClick, description }: { label: string; active: boolean; onClick: () => void; description: string }) {
  return (
    <button className={`accessibility-toggle ${active ? "is-active" : ""}`} onClick={onClick} type="button" aria-pressed={active}>
      <span>
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
      <span className="accessibility-switch" aria-hidden="true">
        <span />
      </span>
    </button>
  );
}
