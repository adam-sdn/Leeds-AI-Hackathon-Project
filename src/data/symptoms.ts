export type Symptom = {
  value: string;
  label: string;
  score: number;
  redFlag?: boolean;
};

export const symptoms: Symptom[] = [
  { value: "fever", label: "Fever", score: 2 },
  { value: "headache", label: "Headache", score: 1 },
  { value: "fatigue", label: "Fatigue", score: 1 },
  { value: "shortness_of_breath", label: "Shortness of Breath", score: 4, redFlag: true },
  { value: "chest_pain", label: "Chest Pain", score: 5, redFlag: true },
];