import { useState } from "react";
import { symptoms } from "../data/symptoms";

type Severity = "mild" | "moderate" | "severe";

interface AnalyzePayload {
  symptoms: string[];
  severity: Severity;
  duration: string;
}

interface SymptomFormProps {
  onAnalyze: (data: AnalyzePayload) => void;
}

export function SymptomForm({ onAnalyze }: SymptomFormProps) {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [severity, setSeverity] = useState<Severity>("mild");
  const [duration, setDuration] = useState("");

  function toggleSymptom(value: string) {
    setSelectedSymptoms((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedSymptoms.length === 0) return;
    onAnalyze({ symptoms: selectedSymptoms, severity, duration });
  }

  return (
    <form className="symptom-form" onSubmit={handleSubmit} noValidate>
      <div className="form-section">
        <h2 className="form-label">Select your symptoms</h2>
        <div className="symptom-grid">
          {symptoms.map((s) => {
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
                <span className="symptom-chip__icon">
                  {s.redFlag ? "⚠️" : "●"}
                </span>
                {s.label}
              </label>
            );
          })}
        </div>
      </div>

      <div className="form-section">
        <h2 className="form-label">Severity</h2>
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
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </label>
          ))}
        </div>
      </div>

      <div className="form-section">
        <h2 className="form-label">How long have you had these symptoms?</h2>
        <input
          type="text"
          className="duration-input"
          placeholder="e.g. 2 days, a week…"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />
      </div>

      <button
        type="submit"
        className="analyze-btn"
        disabled={selectedSymptoms.length === 0}
      >
        Analyze symptoms →
      </button>

      <p className="disclaimer">
        This is not a medical diagnosis. Always consult a qualified clinician.
      </p>
    </form>
  );
}
