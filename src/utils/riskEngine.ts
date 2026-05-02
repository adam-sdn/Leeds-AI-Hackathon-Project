import { symptoms } from "../data/symptoms";

type Severity = "mild" | "moderate" | "severe";

export function analyzeSymptoms(
  selected: string[],
  severity: Severity,
  duration: string
) {
  let score = 0;
  let isRedFlag = false;

  selected.forEach((symptomValue) => {
    const symptom = symptoms.find((s) => s.value === symptomValue);
    if (!symptom) return;

    score += symptom.score;

    if (symptom.redFlag) {
      isRedFlag = true;
    }
  });

  // Severity multiplier
  if (severity === "moderate") score += 2;
  if (severity === "severe") score += 4;

  let riskLevel: "low" | "moderate" | "urgent" = "low";

  if (score >= 6) riskLevel = "urgent";
  else if (score >= 3) riskLevel = "moderate";

  return {
    riskLevel,
    isRedFlag,
    recommendation:
      riskLevel === "urgent"
        ? "Seek medical attention as soon as possible."
        : riskLevel === "moderate"
        ? "Consider seeing a GP if symptoms persist."
        : "Monitor your symptoms and rest.",
    explanation:
      "Based on your selected symptoms and severity, this may indicate a potential health concern. This is not a medical diagnosis.",
  };
}