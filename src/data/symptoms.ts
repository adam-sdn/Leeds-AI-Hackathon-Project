export type Category = 
  | "General & Systemic"
  | "Red Flag Symptoms"
  | "Cardiovascular"
  | "Respiratory"
  | "Gastrointestinal"
  | "Bowel Habit"
  | "Genitourinary"
  | "Musculoskeletal"
  | "ENT & Eyes"
  | "Dermatological"
  | "Mental Health & Social Factors";

export type Symptom = {
  value: string;
  label: string;
  score: number;
  redFlag?: boolean;
  category: Category;
};

export const symptoms: Symptom[] = [
  // General & Systemic
  { value: "fatigue", label: "Tiredness / Fatigue", score: 1, category: "General & Systemic" },
  { value: "fever", label: "Fever or Chills", score: 2, category: "General & Systemic" },
  { value: "weight_change", label: "Unexplained Weight Change", score: 3, category: "General & Systemic" },
  { value: "sleep_problems", label: "Sleep Problems", score: 1, category: "General & Systemic" },

  // Red Flag Symptoms
  { value: "chest_pain", label: "Chest Pain", score: 10, redFlag: true, category: "Red Flag Symptoms" },
  { value: "breathing_difficulty", label: "Difficulty Breathing", score: 10, redFlag: true, category: "Red Flag Symptoms" },
  { value: "non_blanching_rash", label: "Non-Blanching Rash", score: 10, redFlag: true, category: "Red Flag Symptoms" },
  { value: "confusion", label: "Sudden Confusion", score: 10, redFlag: true, category: "Red Flag Symptoms" },
  { value: "unconsciousness", label: "Loss of Consciousness", score: 10, redFlag: true, category: "Red Flag Symptoms" },
  { value: "weakness_numbness", label: "Sudden Weakness / Numbness", score: 10, redFlag: true, category: "Red Flag Symptoms" },
  { value: "facial_droop", label: "Facial Drooping", score: 10, redFlag: true, category: "Red Flag Symptoms" },
  { value: "cough_blood", label: "Coughing Up Blood", score: 10, redFlag: true, category: "Red Flag Symptoms" },
  { value: "allergic_reaction", label: "Severe Allergic Reaction", score: 10, redFlag: true, category: "Red Flag Symptoms" },
  { value: "suicidal_thoughts", label: "Suicidal Thoughts", score: 10, redFlag: true, category: "Red Flag Symptoms" },

  // Cardiovascular
  { value: "palpitations", label: "Palpitations", score: 2, category: "Cardiovascular" },
  { value: "heart_racing", label: "Heart Racing", score: 2, category: "Cardiovascular" },
  { value: "ankle_swelling", label: "Ankle Swelling", score: 2, category: "Cardiovascular" },
  { value: "leg_pain_walking", label: "Leg Pain When Walking", score: 2, category: "Cardiovascular" },

  // Respiratory
  { value: "persistent_cough", label: "Persistent Cough", score: 2, category: "Respiratory" },
  { value: "wheezing", label: "Wheezing", score: 2, category: "Respiratory" },
  { value: "phlegm", label: "Phlegm", score: 1, category: "Respiratory" },
  { value: "shortness_of_breath", label: "Shortness of Breath", score: 4, category: "Respiratory" },

  // Gastrointestinal
  { value: "abdominal_pain", label: "Abdominal Pain", score: 2, category: "Gastrointestinal" },
  { value: "bloating", label: "Bloating", score: 1, category: "Gastrointestinal" },
  { value: "nausea_vomiting", label: "Nausea / Vomiting", score: 2, category: "Gastrointestinal" },
  { value: "swallowing_difficulty", label: "Difficulty Swallowing", score: 3, category: "Gastrointestinal" },
  { value: "jaundice", label: "Jaundice", score: 4, category: "Gastrointestinal" },

  // Bowel Habit
  { value: "bowel_change", label: "Change in Bowel Habit", score: 3, category: "Bowel Habit" },
  { value: "stool_blood", label: "Blood in Stool", score: 4, category: "Bowel Habit" },
  { value: "tarry_stool", label: "Black or Tarry Stool", score: 5, category: "Bowel Habit" },
  { value: "constipation", label: "Constipation", score: 1, category: "Bowel Habit" },

  // Genitourinary
  { value: "painful_urination", label: "Painful Urination", score: 2, category: "Genitourinary" },
  { value: "urine_blood", label: "Blood in Urine", score: 4, category: "Genitourinary" },
  { value: "urinary_frequency", label: "Urinary Frequency / Urgency", score: 2, category: "Genitourinary" },
  { value: "night_urination", label: "Night-Time Urination", score: 1, category: "Genitourinary" },

  // Musculoskeletal
  { value: "back_pain", label: "Back Pain", score: 1, category: "Musculoskeletal" },
  { value: "joint_stiffness", label: "Joint Swelling / Stiffness", score: 2, category: "Musculoskeletal" },
  { value: "muscle_pain", label: "Muscle Pain", score: 1, category: "Musculoskeletal" },
  { value: "neck_pain", label: "Neck Pain", score: 1, category: "Musculoskeletal" },

  // ENT & Eyes
  { value: "vision_change", label: "Sudden Vision Changes", score: 4, category: "ENT & Eyes" },
  { value: "hearing_loss", label: "Hearing Loss / Tinnitus", score: 3, category: "ENT & Eyes" },
  { value: "sore_throat", label: "Sore Throat", score: 1, category: "ENT & Eyes" },
  { value: "earache", label: "Earache", score: 1, category: "ENT & Eyes" },

  // Dermatological
  { value: "lump_bump", label: "New Lump or Bump", score: 3, category: "Dermatological" },
  { value: "itching", label: "Itching", score: 1, category: "Dermatological" },
  { value: "changing_mole", label: "Changing Mole", score: 4, category: "Dermatological" },
  { value: "ulcer", label: "Non-Healing Ulcer", score: 4, category: "Dermatological" },

  // Mental Health & Social Factors
  { value: "low_mood", label: "Low Mood", score: 2, category: "Mental Health & Social Factors" },
  { value: "anxiety", label: "Anxiety", score: 2, category: "Mental Health & Social Factors" },
  { value: "fall_injury", label: "Recent Fall or Injury", score: 3, category: "Mental Health & Social Factors" },
  { value: "smoking", label: "Smoking", score: 0, category: "Mental Health & Social Factors" },
  { value: "alcohol", label: "Alcohol Use", score: 0, category: "Mental Health & Social Factors" },
];