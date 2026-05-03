import { useState } from "react";
import { symptoms } from "../data/symptoms";
import type { Category } from "../data/symptoms";
import type { AppLanguage } from "../types/language";
import { uiText } from "../utils/i18n";

type Severity = "mild" | "moderate" | "severe";

interface AnalyzePayload {
  symptoms: string[];
  severity: Severity;
  duration: string;
}

interface SymptomFormProps {
  onAnalyze: (data: AnalyzePayload) => void;
  language: AppLanguage;
}

const CONCERNS = [
  { id: "general", labelKey: "generalSymptoms", categories: ["General & Systemic", "Musculoskeletal", "Dermatological"] as Category[] },
  { id: "breathing", labelKey: "breathingIssues", categories: ["Respiratory"] as Category[] },
  { id: "pain", labelKey: "painDiscomfort", categories: ["Cardiovascular", "Musculoskeletal", "ENT & Eyes"] as Category[] },
  { id: "stomach", labelKey: "stomachDigestion", categories: ["Gastrointestinal", "Bowel Habit", "Genitourinary"] as Category[] },
  { id: "mental", labelKey: "mentalWellbeing", categories: ["Mental Health & Social Factors"] as Category[] },
  { id: "urgent", labelKey: "urgentConcern", categories: ["Red Flag Symptoms"] as Category[] },
];

export function SymptomForm({ onAnalyze, language }: SymptomFormProps) {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [severity, setSeverity] = useState<Severity>("mild");
  const [duration, setDuration] = useState("");
  const [activeConcern, setActiveConcern] = useState<string | null>(null);

  function toggleSymptom(value: string) {
    setSelectedSymptoms((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
  }

  function removeSymptom(value: string) {
    setSelectedSymptoms((prev) => prev.filter((s) => s !== value));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedSymptoms.length === 0) return;
    onAnalyze({ symptoms: selectedSymptoms, severity, duration });
  }

  const selectedObjects = symptoms.filter((s) => selectedSymptoms.includes(s.value));
  const currentConcern = CONCERNS.find((c) => c.id === activeConcern);
  const filteredSymptoms = currentConcern
    ? symptoms.filter((s) => currentConcern.categories.includes(s.category))
    : [];

  return (
    <form className="symptom-form" onSubmit={handleSubmit} noValidate>
      {selectedSymptoms.length > 0 && (
        <div className="form-section selection-summary">
          <h2 className="form-label">{uiText(language, "selectedSymptoms")}</h2>
          <div className="selected-chips">
            {selectedObjects.map((s) => (
              <span key={s.value} className="chip-active">
                {s.label}
                <button type="button" onClick={() => removeSymptom(s.value)} className="chip-remove">x</button>
              </span>
            ))}
          </div>
        </div>
      )}

      {!activeConcern ? (
        <div className="form-section animate-fade">
          <h2 className="form-label">{uiText(language, "primaryConcern")}</h2>
          <div className="concern-grid">
            {CONCERNS.map((concern) => (
              <button
                key={concern.id}
                type="button"
                className={`concern-card ${concern.id === "urgent" ? "concern-card--urgent" : ""}`}
                onClick={() => setActiveConcern(concern.id)}
              >
                {uiText(language, concern.labelKey)}{concern.id === "urgent" ? " ⚠" : ""}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="form-section animate-slide-up">
          <div className="section-header">
            <h2 className="form-label">
              {uiText(language, "specificSignals")}: {currentConcern ? uiText(language, currentConcern.labelKey) : ""}
            </h2>
            <button type="button" className="btn-back" onClick={() => setActiveConcern(null)}>
              ← {uiText(language, "changeConcern")}
            </button>
          </div>

          <div className="symptom-grid">
            {filteredSymptoms.map((s) => {
              const checked = selectedSymptoms.includes(s.value);
              return (
                <label
                  key={s.value}
                  className={`symptom-chip ${checked ? "symptom-chip--active" : ""} ${s.redFlag ? "symptom-chip--red" : ""}`}
                >
                  <input
                    type="checkbox"
                    value={s.value}
                    checked={checked}
                    onChange={() => toggleSymptom(s.value)}
                    className="symptom-chip__input"
                  />
                  <span className="symptom-chip__icon">{s.redFlag ? "⚠" : "●"}</span>
                  {s.label}
                </label>
              );
            })}
          </div>
        </div>
      )}

      {activeConcern && (
        <div className="animate-fade-delayed">
          <div className="form-section">
            <h2 className="form-label">{uiText(language, "severity")}</h2>
            <div className="severity-group">
              {(["mild", "moderate", "severe"] as Severity[]).map((level) => (
                <label
                  key={level}
                  className={`severity-btn severity-btn--${level} ${severity === level ? "severity-btn--active" : ""}`}
                >
                  <input
                    type="radio"
                    name="severity"
                    value={level}
                    checked={severity === level}
                    onChange={() => setSeverity(level)}
                    className="severity-btn__input"
                  />
                  {uiText(language, level)}
                </label>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h2 className="form-label">{uiText(language, "duration")}</h2>
            <input
              type="text"
              className="duration-input"
              placeholder={uiText(language, "durationPlaceholder")}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>

          <button type="submit" className="analyze-btn kashf-blue-button" disabled={selectedSymptoms.length === 0}>
            <span className="kashf-blue-button__transition" />
            <span className="kashf-blue-button__gradient" />
            <span className="kashf-blue-button__label">{uiText(language, "analyzeSymptoms")} →</span>
          </button>
        </div>
      )}

      <p className="disclaimer">{uiText(language, "disclaimer")}</p>
    </form>
  );
}
