import { useState } from "react";
import { symptoms } from "../data/symptoms";
import type { Category } from "../data/symptoms";

type Severity = "mild" | "moderate" | "severe";

interface AnalyzePayload {
  symptoms: string[];
  severity: Severity;
  duration: string;
}

interface SymptomFormProps {
  onAnalyze: (data: AnalyzePayload) => void;
}

const CONCERNS = [
  { id: "general", label: "General symptoms", categories: ["General & Systemic", "Musculoskeletal", "Dermatological"] as Category[] },
  { id: "breathing", label: "Breathing issues", categories: ["Respiratory"] as Category[] },
  { id: "pain", label: "Pain or discomfort", categories: ["Cardiovascular", "Musculoskeletal", "ENT & Eyes"] as Category[] },
  { id: "stomach", label: "Stomach & digestion", categories: ["Gastrointestinal", "Bowel Habit", "Genitourinary"] as Category[] },
  { id: "mental", label: "Mental wellbeing", categories: ["Mental Health & Social Factors"] as Category[] },
  { id: "urgent", label: "Something urgent ⚠️", categories: ["Red Flag Symptoms"] as Category[] },
];

export function SymptomForm({ onAnalyze }: SymptomFormProps) {
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
    setSelectedSymptoms(prev => prev.filter(s => s !== value));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedSymptoms.length === 0) return;
    onAnalyze({ symptoms: selectedSymptoms, severity, duration });
  }

  const selectedObjects = symptoms.filter(s => selectedSymptoms.includes(s.value));
  const currentConcern = CONCERNS.find(c => c.id === activeConcern);
  const filteredSymptoms = currentConcern 
    ? symptoms.filter(s => currentConcern.categories.includes(s.category))
    : [];

  return (
    <form className="symptom-form" onSubmit={handleSubmit} noValidate>
      
      {/* Selected Symptoms Chips */}
      {selectedSymptoms.length > 0 && (
        <div className="form-section selection-summary">
          <h2 className="form-label">Selected symptoms</h2>
          <div className="selected-chips">
            {selectedObjects.map(s => (
              <span key={s.value} className="chip-active">
                {s.label}
                <button type="button" onClick={() => removeSymptom(s.value)} className="chip-remove">×</button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Step 1: Primary Concern */}
      {!activeConcern ? (
        <div className="form-section animate-fade">
          <h2 className="form-label">What is your primary concern today?</h2>
          <div className="concern-grid">
            {CONCERNS.map(concern => (
              <button
                key={concern.id}
                type="button"
                className={`concern-card ${concern.id === 'urgent' ? 'concern-card--urgent' : ''}`}
                onClick={() => setActiveConcern(concern.id)}
              >
                {concern.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Step 2: Sub-symptoms */
        <div className="form-section animate-slide-up">
          <div className="section-header">
            <h2 className="form-label">Specific signals: {currentConcern?.label}</h2>
            <button type="button" className="btn-back" onClick={() => setActiveConcern(null)}>
              ← Change concern
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
                  <span className="symptom-chip__icon">
                    {s.redFlag ? "⚠️" : "●"}
                  </span>
                  {s.label}
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Common inputs (Severity/Duration) - always visible once a concern is picked */}
      {activeConcern && (
        <div className="animate-fade-delayed">
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
            <h2 className="form-label">How long have you had these signals?</h2>
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
        </div>
      )}

      <p className="disclaimer">
        This is not a medical diagnosis. Always consult a qualified clinician.
      </p>
    </form>
  );
}
