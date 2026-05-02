type RiskLevel = "low" | "moderate" | "urgent";

interface AnalysisResult {
  riskLevel: RiskLevel;
  isRedFlag: boolean;
  recommendation: string;
  explanation: string;
}

interface ResultScreenProps {
  result: AnalysisResult;
  onReset: () => void;
}

const RISK_CONFIG: Record<
  RiskLevel,
  { label: string; emoji: string; colorClass: string; subtext: string }
> = {
  low: {
    label: "Low Risk",
    emoji: "🟢",
    colorClass: "result-card--low",
    subtext: "Your symptoms appear mild at this time.",
  },
  moderate: {
    label: "Moderate Risk",
    emoji: "🟡",
    colorClass: "result-card--moderate",
    subtext: "Your symptoms may warrant professional attention.",
  },
  urgent: {
    label: "Urgent",
    emoji: "🔴",
    colorClass: "result-card--urgent",
    subtext: "Please seek medical care promptly.",
  },
};

export function ResultScreen({ result, onReset }: ResultScreenProps) {
  const config = RISK_CONFIG[result.riskLevel];

  return (
    <div className={`result-card ${config.colorClass}`}>
      {result.isRedFlag && (
        <div className="red-flag-banner">
          <span>⚠️</span>
          <strong>Red flag symptom detected.</strong> If you are experiencing
          severe chest pain or difficulty breathing, call 999 immediately.
        </div>
      )}

      <div className="result-level">
        <span className="result-level__emoji">{config.emoji}</span>
        <div>
          <p className="result-level__label">{config.label}</p>
          <p className="result-level__sub">{config.subtext}</p>
        </div>
      </div>

      <div className="result-block">
        <h2 className="result-block__title">Recommendation</h2>
        <p className="result-block__body">{result.recommendation}</p>
      </div>

      <div className="result-block">
        <h2 className="result-block__title">What this may indicate</h2>
        <p className="result-block__body">{result.explanation}</p>
      </div>

      <p className="result-disclaimer">
        ⚕️ This is not a medical diagnosis. Always consult a qualified clinician
        for professional advice.
      </p>

      <button className="reset-btn" onClick={onReset}>
        ← Start over
      </button>
    </div>
  );
}
