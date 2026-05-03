/**
 * Kashf AI Reasoning Engine.
 *
 * Synthesizes symptom input, connected health data, and facial wellness scan
 * context into cautious NHS-style guidance.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AnalysisResult } from "./riskEngine";
import type { FaceScanResult } from "../components/FaceScan";
import type { ConnectedHealthData } from "../types/health";
import type { AppLanguage } from "../types/language";
import { localisedPromptSuffix, translateText } from "./translation";

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

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ReasoningInput {
  analysis: AnalysisResult;
  scan?: FaceScanResult | null;
  healthData?: ConnectedHealthData | null;
}

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

function describePatientContext(input: ReasoningInput): string {
  const symptomList = input.analysis.selectedSymptomLabels.join(", ") || "No symptoms selected";
  const scanObservations = input.scan?.observations.map((observation) =>
    `${observation.label} (${observation.confidence} confidence, ${observation.region})`
  ).join("; ") || "No facial wellness scan supplied";
  const scanInsights = input.scan?.insights?.join("; ") || "No facial wellness processing notes";
  const healthData = input.healthData;
  const metrics = healthData?.metrics;
  const healthSignals = metrics
    ? [
        `source: ${healthData.brand || "demo health data"}`,
        `resting heart rate: ${metrics.heartRate}`,
        `sleep: ${metrics.sleep}`,
        `activity: ${metrics.activity}`,
        `recovery/readiness: ${metrics.recovery}`,
        `HRV: ${metrics.hrv}`,
        `steps: ${metrics.steps}`,
      ].join("; ")
    : "No connected health metrics supplied";

  return `
PATIENT-REPORTED INPUT
- Symptoms: ${symptomList}
- Severity: ${input.analysis.severity}
- Duration: ${input.analysis.duration || "Not specified"}
- Initial urgency: ${input.analysis.riskLabel}
- Red flag present: ${input.analysis.isRedFlag ? "yes" : "no"}
- Current recommendation: ${input.analysis.recommendation}

CONNECTED HEALTH DATA
- ${healthSignals}

FACIAL WELLNESS SCAN
- Quality: ${input.scan?.scanQuality || "Not supplied"}
- Visual concern level: ${input.scan?.visualConcernLevel || "not assessed"}
- Observations: ${scanObservations}
- Processing notes: ${scanInsights}
`;
}

function safetyGuidelines(): string {
  return `
NHS-STYLE SAFETY RULES
- Kashf is not a diagnostic tool and does not replace a GP, NHS 111, 999, A&E, urgent care, or a pharmacist.
- Use UK wording: GP, NHS 111, 999, A&E, pharmacist, urgent care.
- Use cautious language: "may", "could", "consider", "possible", "visible wellness signals".
- Never diagnose, claim certainty, recommend medication, or give treatment instructions.
- Facial scan data must only be described as visible wellness signals, never clinical proof.
- Never say a facial scan is "healthy". If visual concern level is moderate or high, make the output more cautious and suggest sharing changes with a GP/NHS 111 alongside symptoms.
- If red flags are present, advise calling 999 or going to A&E.
- If symptoms are severe, sudden, worsening, or the user is worried, advise seeking medical advice.
- Always include the idea that this is not a medical diagnosis.
`;
}

export async function generateTailoredInsight(input: ReasoningInput): Promise<TailoredInsight> {
  if (!genAI) {
    console.warn("[AI Reasoning Engine] No Gemini API key found. Using heuristic fallback.");
    return generateHeuristicFallback(input);
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `
You are Kashf, an NHS-style patient guidance assistant.
Synthesize all supplied patient context into a tailored, cautious health insight.

${describePatientContext(input)}

OUTPUT FORMAT (JSON):
{
  "clinicalNarrative": "A 2-3 sentence patient-friendly summary connecting symptoms, health metrics, and facial wellness signals without diagnosing.",
  "dynamicGPQuestions": ["3-5 specific questions for the user to ask their GP"],
  "systemCorrelations": ["3 specific links found between symptom input, connected health data, and facial wellness data"],
  "personalizedAdvice": "1-2 sentences of safety-first guidance using NHS-style wording.",
  "nextStep": "A concise recommended action.",
  "careImpact": {
    "actNow": ["2 benefits of acting immediately"],
    "delayed": ["2 risks or consequences of delaying care"]
  },
  "whySuggested": ["2-3 bullet points explaining why this care level was chosen"],
  "biggerPicture": ["2 points about the broader health impact of these symptoms"]
}

${safetyGuidelines()}
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
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

export async function generateChatAssistantReply(
  input: ReasoningInput,
  messages: ChatMessage[],
  tailoredInsight?: TailoredInsight | null,
  language: AppLanguage = "en"
): Promise<string> {
  const latestUserMessage = [...messages].reverse().find((message) => message.role === "user")?.content || "";

  if (!genAI) {
    return translateText(generateChatFallback(input, latestUserMessage, tailoredInsight), language);
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const conversation = messages
    .slice(-8)
    .map((message) => `${message.role === "user" ? "User" : "Kashf"}: ${message.content}`)
    .join("\n");

  const prompt = `
You are the Kashf results-page assistant. Answer the user's follow-up using only the supplied assessment context.
Keep the answer short, calm, patient-friendly, and NHS-style.
${localisedPromptSuffix(language)}

${describePatientContext(input)}

TAILORED INSIGHT ALREADY SHOWN
${tailoredInsight ? JSON.stringify(tailoredInsight) : "No tailored insight available yet."}

CONVERSATION
${conversation}

${safetyGuidelines()}

Return plain text only. Do not use markdown tables. Do not invent missing medical history.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("[AI Chat Assistant] Gemini processing error. Falling back to heuristics.", error);
    return translateText(generateChatFallback(input, latestUserMessage, tailoredInsight), language);
  }
}

async function generateHeuristicFallback(input: ReasoningInput): Promise<TailoredInsight> {
  const { analysis, scan, healthData } = input;
  const symptoms = analysis.selectedSymptomLabels;
  const risk = analysis.riskLevel;
  const correlations: string[] = [];

  if (symptoms.some((symptom) => symptom.toLowerCase().includes("muscle")) && healthData?.metrics?.steps) {
    const steps = parseInt(healthData.metrics.steps.replace(",", ""));
    if (steps > 8000) {
      correlations.push("Your active step count may be relevant context for muscle discomfort, but it does not confirm a cause.");
    }
  }

  if (healthData?.metrics?.heartRate && parseFloat(healthData.metrics.heartRate) > 90) {
    correlations.push("Your resting heart rate is worth sharing alongside your symptoms, especially if it feels unusual for you.");
  }

  if (
    scan?.observations.some((observation) => observation.type === "under_eye_darkness") &&
    symptoms.some((symptom) => symptom.toLowerCase().includes("fatigue"))
  ) {
    correlations.push("Visible under-eye wellness signals sit alongside your reported fatigue, but they are not diagnostic.");
  }

  if (scan?.visualConcernLevel && scan.visualConcernLevel !== "low") {
    correlations.push(`The facial scan produced a ${scan.visualConcernLevel} visual concern level. This is not diagnostic, but it should make the guidance more cautious rather than reassuring.`);
  }

  if (healthData?.metrics?.sleep) {
    correlations.push(`Sleep duration (${healthData.metrics.sleep}) may help a GP understand your broader wellness context.`);
  }

  if (correlations.length === 0) {
    correlations.push("Your reported symptoms are the main driver of this guidance.");
    correlations.push("Connected health data and facial wellness signals are supporting context only.");
  }

  const dynamicGPQuestions = [...analysis.gpQuestions];
  if (healthData?.metrics) {
    dynamicGPQuestions.push(`My connected health data shows ${healthData.metrics.heartRate} resting heart rate and ${healthData.metrics.sleep} sleep. Could this be relevant to my symptoms?`);
    dynamicGPQuestions.push("Should I keep tracking recovery, HRV, or sleep while these symptoms continue?");
  }
  if (scan?.observations.length) {
    dynamicGPQuestions.push("Are the visible wellness changes I noticed worth mentioning alongside my symptoms?");
  }

  const safetyNetting = "This is not a medical diagnosis. If symptoms are severe, sudden, worsening, or you are worried, seek medical advice. If you feel seriously unwell, call 999 or go to A&E.";
  const nextStep =
    risk === "urgent"
      ? "Call 999 or go to A&E now if symptoms are severe, sudden, or worsening."
      : risk === "moderate"
        ? "Consider contacting your GP or NHS 111, especially if symptoms continue or worsen."
        : "Monitor your symptoms and consider a pharmacist, GP, or NHS 111 if you are unsure or symptoms change.";

  return {
    clinicalNarrative: `Your report of ${symptoms.join(", ") || "no selected symptoms"} suggests ${analysis.riskLabel.toLowerCase()} based on this check. Kashf has combined your symptom input with ${healthData ? "connected health signals" : "available health context"} and ${scan ? "visible facial wellness signals" : "any facial scan context"} as supporting information, not as a diagnosis.`,
    dynamicGPQuestions: Array.from(new Set(dynamicGPQuestions)),
    systemCorrelations: correlations,
    personalizedAdvice: `${nextStep} ${safetyNetting}`,
    nextStep,
    careImpact: {
      actNow: risk === "urgent"
        ? ["Urgent services can assess serious symptoms quickly.", "Clearer next steps may reduce the chance of deterioration."]
        : ["You may get reassurance sooner.", "A GP, pharmacist, or NHS 111 can help decide whether monitoring is enough."],
      delayed: risk === "urgent"
        ? ["Potentially serious symptoms could worsen.", "Care may become more complex if urgent signs are ignored."]
        : ["Symptoms may persist or become harder to interpret.", "You may miss the chance to share a clear symptom history early."]
    },
    whySuggested: analysis.why,
    biggerPicture: analysis.biggerPicture
  };
}

function generateChatFallback(
  input: ReasoningInput,
  latestUserMessage: string,
  tailoredInsight?: TailoredInsight | null
): string {
  const question = latestUserMessage.toLowerCase();
  const symptoms = input.analysis.selectedSymptomLabels.join(", ") || "your reported symptoms";
  const nextStep = tailoredInsight?.nextStep || input.analysis.recommendation;
  const safety = "This is not a medical diagnosis. If symptoms are severe, sudden, worsening, or you are worried, seek medical advice; call 999 or go to A&E if you feel seriously unwell.";

  if (question.includes("gp") || question.includes("doctor")) {
    const gpQuestions = tailoredInsight?.dynamicGPQuestions || input.analysis.gpQuestions;
    return `For your GP, mention ${symptoms}, the duration (${input.analysis.duration || "not specified"}), severity (${input.analysis.severity}), and any connected health or facial wellness observations. Useful questions include: ${gpQuestions.slice(0, 3).join(" ")} ${safety}`;
  }

  if (question.includes("face") || question.includes("scan")) {
    const observations = input.scan?.observations.map((observation) => observation.label).join(", ") || "no completed facial scan";
    return `The facial scan is treated only as visible wellness context. It noted ${observations}, but this cannot diagnose a condition. The symptom input remains the main basis for the guidance. ${safety}`;
  }

  if (question.includes("health") || question.includes("sleep") || question.includes("heart") || question.includes("recovery")) {
    const metrics = input.healthData?.metrics;
    if (!metrics) {
      return `No connected health data was supplied for this result, so the guidance is based mainly on your symptom answers. ${safety}`;
    }
    return `Your connected health data adds context: heart rate ${metrics.heartRate}, sleep ${metrics.sleep}, recovery ${metrics.recovery}, HRV ${metrics.hrv}, and steps ${metrics.steps}. Share these with a GP or NHS 111 if you seek advice. ${safety}`;
  }

  if (question.includes("next") || question.includes("what should")) {
    return `The suggested next step is: ${nextStep} This is based on ${symptoms}, severity ${input.analysis.severity}, and duration ${input.analysis.duration || "not specified"}. ${safety}`;
  }

  return `Based on this result, Kashf is linking ${symptoms} with any connected health data and visible wellness scan context to suggest: ${nextStep} ${safety}`;
}
