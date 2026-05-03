/**
 * Kashf AI Reasoning Engine (Gemini-Powered)
 * 
 * This engine synthesizes Symptoms, Face Scan, and Wearable data
 * using Google's Gemini Pro model for deep clinical context.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AnalysisResult } from "./riskEngine";
import type { FaceScanResult } from "../components/FaceScan";

export interface TailoredInsight {
  clinicalNarrative: string;
  dynamicGPQuestions: string[];
  systemCorrelations: string[];
  personalizedAdvice: string;
  nextStep: string;
  careImpact: {
    actNow: string[];
    delayed: string[];
  };
  whySuggested: string[];
  biggerPicture: string[];
}

export interface ReasoningInput {
  analysis: AnalysisResult;
  scan?: FaceScanResult | null;
  healthData?: any | null;
}

// Access the API key from environment variables
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

/**
 * Generates a tailored insight using Gemini AI.
 * Falls back to heuristic logic if API key is missing.
 */
export async function generateTailoredInsight(input: ReasoningInput): Promise<TailoredInsight> {
  if (!genAI) {
    console.warn("[AI Reasoning Engine] No Gemini API key found. Using heuristic fallback.");
    return generateHeuristicFallback(input);
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    You are Kashf, a clinical decision support AI. 
    Synthesize the following patient data into a tailored, cautious health insight.
    
    PATIENT SYMPTOMS:
    - Symptoms: ${input.analysis.selectedSymptomLabels.join(", ")}
    - Severity: ${input.analysis.severity}
    - Duration: ${input.analysis.duration}
    - Initial Urgency: ${input.analysis.riskLabel}
    
    FACIAL WELLNESS SCAN:
    - Quality: ${input.scan?.scanQuality || "N/A"}
    - Observations: ${input.scan?.observations.map(o => o.label).join(", ") || "None"}
    
    HEALTH WEARABLE DATA:
    - Heart Rate: ${input.healthData?.metrics?.heartRate || "N/A"}
    - Recovery: ${input.healthData?.metrics?.recovery || "N/A"}
    - Sleep: ${input.healthData?.metrics?.sleep || "N/A"}
    
    OUTPUT FORMAT (JSON):
    {
      "clinicalNarrative": "A 2-3 sentence summary connecting symptoms to wellness signals.",
      "dynamicGPQuestions": ["3 specific questions for the user to ask their GP"],
      "systemCorrelations": ["2-3 specific links found between different data points"],
      "personalizedAdvice": "1 sentence of safety-first guidance.",
      "nextStep": "A concise recommended action (e.g., 'Book a GP appointment within 48 hours').",
      "careImpact": {
        "actNow": ["2 benefits of acting immediately"],
        "delayed": ["2 risks or consequences of delaying care"]
      },
      "whySuggested": ["2-3 bullet points explaining why this care level was chosen"],
      "biggerPicture": ["2 points about the broader health impact of these symptoms"]
    }
    
    GUIDELINES:
    - Be cautious and non-diagnostic. Use "possible", "visible signals", "may correlate".
    - Do not give medical treatment instructions.
    - If risk is urgent, prioritize safety.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("[AI Reasoning Engine] Raw model response:", text);

    // More robust JSON extraction
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in model response");
    }
    
    return JSON.parse(jsonMatch[0]);

  } catch (error) {
    console.error("[AI Reasoning Engine] Gemini processing error. Falling back to heuristics.", error);
    return generateHeuristicFallback(input);
  }
}

/**
 * Robust fallback logic if the AI service is unavailable.
 */
async function generateHeuristicFallback(input: ReasoningInput): Promise<TailoredInsight> {
  const { analysis, scan, healthData } = input;
  const symptoms = analysis.selectedSymptomLabels;
  const risk = analysis.riskLevel;

  const correlations: string[] = [];
  
  // Heuristic: Muscle Pain + High Activity
  if (symptoms.some(s => s.toLowerCase().includes("muscle")) && healthData?.metrics?.steps) {
    const steps = parseInt(healthData.metrics.steps.replace(',', ''));
    if (steps > 8000) {
      correlations.push("Your high activity level (8,000+ steps) likely contributes to the reported muscle discomfort.");
    }
  }

  // Heuristic: Heart Rate + Urgency
  if (healthData?.metrics?.heartRate && parseFloat(healthData.metrics.heartRate) > 90) {
    correlations.push("Elevated resting heart rate matches the physiological stress indicated by your symptoms.");
  }

  // Heuristic: Fatigue + Scan
  if (scan?.observations.some(o => o.type === "under_eye_darkness") && symptoms.some(s => s.toLowerCase().includes("fatigue"))) {
    correlations.push("Visible under-eye wellness signals correlate with your reported fatigue level.");
  }

  if (correlations.length === 0) {
    correlations.push("Analyzing physiological patterns between reported symptoms and wearable data...");
    correlations.push("Cross-referencing wellness signals with clinical urgency markers.");
  }

  const dynamicGPQuestions = [...analysis.gpQuestions];
  if (healthData?.metrics) {
    dynamicGPQuestions.push(`"My wearable shows a ${healthData.metrics.heartRate} heart rate—is this expected given my symptoms?"`);
  }

  return {
    clinicalNarrative: `Your report of ${symptoms.join(", ")} indicates a ${risk} urgency level. Kashf combined your ${scan ? 'facial signals' : 'symptoms'} and ${healthData ? 'health metrics' : 'history'} to synthesize this view.`,
    dynamicGPQuestions: Array.from(new Set(dynamicGPQuestions)),
    systemCorrelations: correlations,
    personalizedAdvice: risk === 'urgent' ? "Seek medical attention promptly as recommended." : "Monitor your symptoms, prioritize rest, and stay hydrated.",
    nextStep: analysis.recommendation,
    careImpact: {
      actNow: risk === 'urgent' ? ["Immediate relief", "Prevention of complications"] : ["Faster reassurance", "Early management"],
      delayed: risk === 'urgent' ? ["Risk of escalation", "Longer recovery"] : ["Persistent discomfort", "Delayed diagnosis"]
    },
    whySuggested: analysis.why,
    biggerPicture: analysis.biggerPicture
  };
}
