import { symptoms } from "../data/symptoms";
import type { Category } from "../data/symptoms";

export type Severity = "mild" | "moderate" | "severe";
export type RiskLevel = "low" | "moderate" | "urgent";

export type AnalysisInput = {
  selectedSymptoms: string[];
  severity: Severity;
  duration: string;
};

export type AnalysisResult = {
  riskLevel: RiskLevel;
  riskLabel: string;
  riskSummary: string;
  isRedFlag: boolean;
  recommendation: string;
  explanation: string;
  why: string[];
  biggerPicture: string[];
  gpQuestions: string[];
  selectedSymptomLabels: string[];
  selectedCategories: string[];
  duration: string;
  severity: Severity;
};

export function analyzeSymptoms(input: AnalysisInput): AnalysisResult {
  const selected = symptoms.filter((symptom) =>
    input.selectedSymptoms.includes(symptom.value)
  );

  const symptomScore = selected.reduce((total, symptom) => total + symptom.score, 0);

  const severityScore =
    input.severity === "severe" ? 4 : input.severity === "moderate" ? 2 : 0;

  const totalScore = symptomScore + severityScore;
  const isRedFlag = selected.some((symptom) => symptom.redFlag);

  let riskLevel: RiskLevel = "low";

  if (isRedFlag || totalScore >= 6) {
    riskLevel = "urgent";
  } else if (totalScore >= 3) {
    riskLevel = "moderate";
  }

  const riskLabelMap = {
    low: "Low concern",
    moderate: "Moderate concern",
    urgent: "Urgent concern",
  };

  const riskSummaryMap = {
    low: "Your selected symptoms do not currently suggest urgent concern based on this check.",
    moderate: "You may benefit from speaking to a GP or qualified clinician, especially if symptoms continue or worsen.",
    urgent: "Some symptoms may need urgent attention.",
  };

  const recommendationMap = {
    low: "Monitor your symptoms and seek advice if they change or worsen.",
    moderate: "Consider booking a GP appointment or contacting NHS 111 if unsure.",
    urgent: "Call 999 or go to A&E now if symptoms are severe, sudden, or worsening.",
  };

  const selectedCategories = Array.from(new Set(selected.map(s => s.category)));

  const why = [
    selected.length > 0
      ? `Identified ${selected.length} signal(s) including: ${selected.slice(0, 3).map(s => s.label).join(", ")}${selected.length > 3 ? " and others" : ""}.`
      : "No symptoms were selected.",
    isRedFlag ? "One or more 'Red Flag' symptoms were identified." : null,
    `Signals described as ${input.severity} in severity.`,
    input.duration ? `Duration reported: ${input.duration}.` : "Duration was not specified.",
  ].filter(Boolean) as string[];

  const biggerPicture = [
    "Understanding which physiological systems (e.g., " + (selectedCategories[0] || "general systemic") + ") are affected can help clinicians narrow down potential issues.",
    "Delayed presentation for certain symptoms can lead to more complex treatment paths later.",
    "Recording these symptoms now ensures you have a reliable history to share with a GP.",
  ];

  const gpQuestions = [
    "Are these symptoms typical or do they suggest something that needs monitoring?",
    "What specific red flags should I look out for going forward?",
    "If these symptoms persist, what would be the next investigation step?",
  ];

  return {
    riskLevel,
    riskLabel: riskLabelMap[riskLevel],
    riskSummary: riskSummaryMap[riskLevel],
    isRedFlag,
    recommendation: recommendationMap[riskLevel],
    explanation: "Kashf has reviewed your inputs to provide an urgency assessment. This is not a diagnosis.",
    why,
    biggerPicture,
    gpQuestions,
    selectedSymptomLabels: selected.map((s) => s.label),
    selectedCategories,
    duration: input.duration,
    severity: input.severity,
  };
}