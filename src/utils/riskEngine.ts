import { symptoms } from "../data/symptoms";

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
  nhsReferences: Array<{
    label: string;
    url: string;
  }>;
  duration: string;
  severity: Severity;
};

const nhsReferenceMap: Record<string, { label: string; url: string }> = {
  chest_pain: { label: "Chest pain", url: "https://www.nhs.uk/symptoms/chest-pain/" },
  shortness_breath: { label: "Shortness of breath", url: "https://www.nhs.uk/symptoms/shortness-of-breath/" },
  cough_blood: { label: "Coughing up blood", url: "https://www.nhs.uk/symptoms/coughing-up-blood/" },
  confusion: { label: "Sudden confusion", url: "https://www.nhs.uk/symptoms/confusion/" },
  fainting: { label: "Fainting", url: "https://www.nhs.uk/symptoms/fainting/" },
  seizure: { label: "What to do if someone has a seizure", url: "https://www.nhs.uk/symptoms/what-to-do-if-someone-has-a-seizure-fit/" },
  fatigue: { label: "Tiredness and fatigue", url: "https://www.nhs.uk/symptoms/tiredness-and-fatigue/" },
  headache: { label: "Headaches", url: "https://www.nhs.uk/symptoms/headaches/" },
  dizziness: { label: "Dizziness", url: "https://www.nhs.uk/symptoms/dizziness/" },
  fever: { label: "High temperature in adults", url: "https://www.nhs.uk/symptoms/fever-in-adults/" },
  vomiting: { label: "Diarrhoea and vomiting", url: "https://www.nhs.uk/symptoms/diarrhoea-and-vomiting/" },
  stomach_pain: { label: "Stomach ache", url: "https://www.nhs.uk/symptoms/stomach-ache/" },
  rash: { label: "Rashes in babies and children", url: "https://www.nhs.uk/symptoms/rashes-babies-and-children/" },
  palpitations: { label: "Heart palpitations", url: "https://www.nhs.uk/symptoms/heart-palpitations/" },
  weight_loss: { label: "Unintentional weight loss", url: "https://www.nhs.uk/symptoms/unintentional-weight-loss/" },
};

function getNhsReferences(selected: typeof symptoms) {
  const byValue = selected
    .map((symptom) => nhsReferenceMap[symptom.value])
    .filter((reference): reference is { label: string; url: string } => Boolean(reference));

  if (byValue.length > 0) return Array.from(new Map(byValue.map((item) => [item.url, item])).values());

  return selected.slice(0, 3).map((symptom) => ({
    label: symptom.label,
    url: "https://www.nhs.uk/symptoms/",
  }));
}

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
  const nhsReferences = getNhsReferences(selected);

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
    nhsReferences,
    duration: input.duration,
    severity: input.severity,
  };
}
