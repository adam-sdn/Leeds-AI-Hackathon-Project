/**
 * Kashf AI Reasoning Engine
 * 
 * This engine synthesizes multiple data streams (Symptoms, Face Scan, Wearables)
 * to generate a tailored, contextual health insight.
 * 
 * Note: In a production environment, this module would interface with a 
 * Large Language Model (LLM) like Gemini or GPT-4.
 */

import type { AnalysisResult } from "./riskEngine";
import type { FaceScanResult } from "../components/FaceScan";

export interface TailoredInsight {
  clinicalNarrative: string;
  dynamicGPQuestions: string[];
  systemCorrelations: string[];
  personalizedAdvice: string;
}

export interface ReasoningInput {
  analysis: AnalysisResult;
  scan?: FaceScanResult | null;
  healthData?: any | null;
}

/**
 * Generates a tailored insight by correlating symptoms with wellness signals.
 */
export async function generateTailoredInsight(input: ReasoningInput): Promise<TailoredInsight> {
  const { analysis, scan, healthData } = input;
  
  console.log("[AI Reasoning Engine] Synthesizing tailored insights from multi-modal input...");

  // Simulate AI processing time
  await new Promise(resolve => setTimeout(resolve, 1200));

  const symptoms = analysis.selectedSymptomLabels;
  const risk = analysis.riskLevel;
  
  // 1. Generate Clinical Narrative
  let clinicalNarrative = `Based on your report of ${symptoms.join(", ")}, Kashf has identified a ${risk} level of urgency. `;
  
  if (scan && scan.observations.length > 0) {
    const scanSignals = scan.observations.map(o => o.label.toLowerCase()).join(", ");
    clinicalNarrative += `This assessment is further contextualized by visible wellness signals, specifically ${scanSignals}. `;
  }

  if (healthData && healthData.metrics) {
    clinicalNarrative += `Connected health data shows a ${healthData.metrics.recovery} recovery score and a resting heart rate of ${healthData.metrics.heartRate}. `;
  }

  clinicalNarrative += "This combination of subjective symptoms and objective physiological data provides a broader view of your current wellness state.";

  // 2. Generate System Correlations
  const correlations: string[] = [];
  
  if (healthData?.metrics?.heartRate && parseFloat(healthData.metrics.heartRate) > 90 && risk === 'urgent') {
    correlations.push("Elevated resting heart rate correlates with the urgency of your reported symptoms.");
  }

  if (scan?.observations.some(o => o.type === "under_eye_darkness") && symptoms.some(s => s.toLowerCase().includes("fatigue"))) {
    correlations.push("Visible under-eye cues appear consistent with your reported feelings of fatigue.");
  }

  if (healthData?.metrics?.recovery && parseFloat(healthData.metrics.recovery) < 50) {
    correlations.push("Low recovery data from your wearable suggests your body is under physiological stress, matching your symptom onset.");
  }

  // 3. Dynamic GP Questions
  const dynamicGPQuestions = [...analysis.gpQuestions];
  
  if (healthData?.metrics) {
    dynamicGPQuestions.push(`"My wearable shows a ${healthData.metrics.heartRate} heart rate and ${healthData.metrics.recovery} recovery—is this expected given my symptoms?"`);
  }
  
  if (scan && scan.observations.length > 0) {
    dynamicGPQuestions.push(`"Kashf noted visible ${scan.observations[0].region} signals during my wellness scan; how do these relate to my ${symptoms[0]}?"`);
  }

  // 4. Personalized Advice (Safety-first)
  let personalizedAdvice = "Continue monitoring your symptoms closely. ";
  if (risk === 'urgent') {
    personalizedAdvice += "Given the urgency, avoid strenuous activity and ensure you follow the recommendation to seek immediate care.";
  } else if (parseFloat(healthData?.metrics?.recovery || "100") < 60) {
    personalizedAdvice += "Prioritize rest and hydration, as your wellness data suggests reduced physiological readiness.";
  } else {
    personalizedAdvice += "Maintain your routine but be mindful of any changes in the frequency of these symptoms.";
  }

  return {
    clinicalNarrative,
    dynamicGPQuestions: Array.from(new Set(dynamicGPQuestions)),
    systemCorrelations: correlations.length > 0 ? correlations : ["No specific cross-system correlations identified."],
    personalizedAdvice
  };
}

/**
 * TIP FOR THE USER: 
 * To swap this with a real AI model, you would change this function to:
 * 
 * const response = await fetch('https://api.openai.com/v1/chat/completions', {
 *   method: 'POST',
 *   body: JSON.stringify({
 *     model: 'gpt-4',
 *     messages: [{ role: 'user', content: generatePrompt(input) }]
 *   })
 * });
 */
