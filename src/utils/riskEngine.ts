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

export const nhsReferenceMap: Record<string, { label: string; url: string; keywords?: string[] }> = {
  chest_pain: { label: "Chest pain", url: "https://www.nhs.uk/symptoms/chest-pain/" },
  shortness_breath: { label: "Shortness of breath", url: "https://www.nhs.uk/symptoms/shortness-of-breath/" },
  breathing_difficulty: { label: "Shortness of breath", url: "https://www.nhs.uk/symptoms/shortness-of-breath/", keywords: ["breathing", "breathless", "difficulty breathing"] },
  cough_blood: { label: "Coughing up blood", url: "https://www.nhs.uk/symptoms/coughing-up-blood/" },
  confusion: { label: "Sudden confusion", url: "https://www.nhs.uk/symptoms/confusion/" },
  unconsciousness: { label: "Fainting", url: "https://www.nhs.uk/symptoms/fainting/", keywords: ["loss of consciousness", "passed out", "faint"] },
  weakness_numbness: { label: "Pins and needles", url: "https://www.nhs.uk/symptoms/pins-and-needles/", keywords: ["numbness", "weakness", "tingling"] },
  facial_droop: { label: "Stroke", url: "https://www.nhs.uk/conditions/stroke/symptoms/", keywords: ["facial droop", "face drooping", "stroke"] },
  allergic_reaction: { label: "Anaphylaxis", url: "https://www.nhs.uk/conditions/anaphylaxis/", keywords: ["allergic", "anaphylaxis"] },
  suicidal_thoughts: { label: "Suicidal thoughts", url: "https://www.nhs.uk/mental-health/feelings-symptoms-behaviours/behaviours/help-for-suicidal-thoughts/", keywords: ["suicidal", "self harm"] },
  fainting: { label: "Fainting", url: "https://www.nhs.uk/symptoms/fainting/" },
  seizure: { label: "What to do if someone has a seizure", url: "https://www.nhs.uk/symptoms/what-to-do-if-someone-has-a-seizure-fit/" },
  fatigue: { label: "Tiredness and fatigue", url: "https://www.nhs.uk/symptoms/tiredness-and-fatigue/" },
  sleep_problems: { label: "Insomnia", url: "https://www.nhs.uk/conditions/insomnia/", keywords: ["sleep", "insomnia"] },
  headache: { label: "Headaches", url: "https://www.nhs.uk/symptoms/headaches/" },
  dizziness: { label: "Dizziness", url: "https://www.nhs.uk/symptoms/dizziness/" },
  fever: { label: "High temperature in adults", url: "https://www.nhs.uk/symptoms/fever-in-adults/" },
  persistent_cough: { label: "Cough", url: "https://www.nhs.uk/symptoms/cough/", keywords: ["cough"] },
  wheezing: { label: "Shortness of breath", url: "https://www.nhs.uk/symptoms/shortness-of-breath/", keywords: ["wheeze", "wheezing"] },
  vomiting: { label: "Diarrhoea and vomiting", url: "https://www.nhs.uk/symptoms/diarrhoea-and-vomiting/" },
  nausea_vomiting: { label: "Feeling sick (nausea)", url: "https://www.nhs.uk/symptoms/feeling-sick-nausea/", keywords: ["nausea", "vomit", "being sick"] },
  stomach_pain: { label: "Stomach ache", url: "https://www.nhs.uk/symptoms/stomach-ache/" },
  abdominal_pain: { label: "Stomach ache", url: "https://www.nhs.uk/symptoms/stomach-ache/", keywords: ["abdominal", "stomach", "tummy"] },
  bloating: { label: "Bloating", url: "https://www.nhs.uk/symptoms/bloating/" },
  constipation: { label: "Constipation", url: "https://www.nhs.uk/conditions/constipation/" },
  swallowing_difficulty: { label: "Dysphagia", url: "https://www.nhs.uk/symptoms/swallowing-problems-dysphagia/", keywords: ["swallowing", "dysphagia"] },
  stool_blood: { label: "Bleeding from the bottom", url: "https://www.nhs.uk/symptoms/bleeding-from-the-bottom-rectal-bleeding/", keywords: ["blood in stool", "rectal bleeding"] },
  urine_blood: { label: "Blood in urine", url: "https://www.nhs.uk/symptoms/blood-in-urine/" },
  painful_urination: { label: "Pain when urinating", url: "https://www.nhs.uk/conditions/urinary-tract-infections-utis/", keywords: ["painful urination", "uti"] },
  rash: { label: "Rashes in babies and children", url: "https://www.nhs.uk/symptoms/rashes-babies-and-children/" },
  non_blanching_rash: { label: "Rashes in babies and children", url: "https://www.nhs.uk/symptoms/rashes-babies-and-children/", keywords: ["non blanching rash", "rash"] },
  palpitations: { label: "Heart palpitations", url: "https://www.nhs.uk/symptoms/heart-palpitations/" },
  heart_racing: { label: "Heart palpitations", url: "https://www.nhs.uk/symptoms/heart-palpitations/", keywords: ["heart racing"] },
  ankle_swelling: { label: "Swollen ankles, feet and legs", url: "https://www.nhs.uk/conditions/oedema/", keywords: ["swollen ankles", "swelling"] },
  weight_loss: { label: "Unintentional weight loss", url: "https://www.nhs.uk/symptoms/unintentional-weight-loss/" },
  weight_change: { label: "Unintentional weight loss", url: "https://www.nhs.uk/symptoms/unintentional-weight-loss/", keywords: ["weight loss", "weight change"] },
  back_pain: { label: "Back pain", url: "https://www.nhs.uk/conditions/back-pain/" },
  joint_stiffness: { label: "Joint pain", url: "https://www.nhs.uk/symptoms/joint-pain/", keywords: ["joint", "stiffness"] },
  muscle_pain: { label: "Muscle aches and pains", url: "https://www.nhs.uk/live-well/pain/muscle-bone-and-joint-pain/", keywords: ["muscle pain", "muscle ache"] },
  neck_pain: { label: "Neck pain", url: "https://www.nhs.uk/symptoms/neck-pain-and-stiff-neck/" },
  vision_change: { label: "Vision loss", url: "https://www.nhs.uk/conditions/vision-loss/", keywords: ["vision", "eyesight"] },
  hearing_loss: { label: "Hearing loss", url: "https://www.nhs.uk/conditions/hearing-loss/" },
  sore_throat: { label: "Sore throat", url: "https://www.nhs.uk/symptoms/sore-throat/" },
  earache: { label: "Earache", url: "https://www.nhs.uk/symptoms/earache/" },
  lump_bump: { label: "Lumps", url: "https://www.nhs.uk/symptoms/lumps/", keywords: ["lump", "bump"] },
  itching: { label: "Itchy skin", url: "https://www.nhs.uk/symptoms/itchy-skin/", keywords: ["itching", "itchy"] },
  low_mood: { label: "Low mood, sadness and depression", url: "https://www.nhs.uk/mental-health/feelings-symptoms-behaviours/feelings-and-symptoms/low-mood-sadness-depression/" },
  anxiety: { label: "Anxiety, fear and panic", url: "https://www.nhs.uk/mental-health/feelings-symptoms-behaviours/feelings-and-symptoms/anxiety-fear-panic/" },
};

export function findNhsReferencesForText(text: string) {
  const normalised = text.toLowerCase();
  const matches = Object.values(nhsReferenceMap).filter((reference) => {
    const label = reference.label.toLowerCase();
    return normalised.includes(label) || reference.keywords?.some((keyword) => normalised.includes(keyword));
  });
  return Array.from(new Map(matches.map((item) => [item.url, item])).values()).slice(0, 4);
}

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
