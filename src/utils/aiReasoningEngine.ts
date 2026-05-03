/**
 * Kashf AI Reasoning Engine.
 *
 * Synthesizes symptom input, connected health data, and facial wellness scan
 * context into cautious NHS-style guidance.
 */

import type { AnalysisResult } from "./riskEngine";
import { findNhsReferencesForText } from "./riskEngine";
import type { FaceScanResult } from "../components/FaceScan";
import type { ConnectedHealthData } from "../types/health";
import type { AppLanguage } from "../types/language";
import { localisedPromptSuffix, selectedLanguageName, translateText } from "./translation";
import { KASHF_SYSTEM_PROMPT } from "./kashfPrompt.js";

export interface TailoredInsight {
  clinicalNarrative: string;
  dynamicGPQuestions: string[];
  systemCorrelations: string[];
  personalizedAdvice: string;
  nhsSelfCareRecommendations: string[];
  nextStep: string;
  careImpact: {
    actNow: string[];
    delayed: string[];
    impact: {
      time: string;
      complexity: string;
      escalation: string;
    };
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

type GroqChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type GroqKashfReport = {
  riskLevel?: "low" | "moderate" | "urgent";
  riskReason?: string;
  tailoredPerspective?: string;
  systemCorrelations?: string[];
  facialSignals?: string[];
  wearableInsights?: string[];
  recommendedAction?: "self-care" | "pharmacy" | "gp" | "urgent-care" | "emergency";
  recommendedActionText?: string;
  nextSteps?: string[];
  nhsSymptomMatches?: Array<{
    symptom: string;
    nhsLabel: string;
    nhsUrl: string;
  }>;
  nhsSelfCareGuidance?: string[];
  careImpactDashboard?: {
    ifActNow?: string[];
    ifDelayed?: string[];
    estimatedImpact?: {
      time?: "Minimal" | "Low" | "Moderate" | "High" | string;
      care?: "Low" | "Moderate" | "High" | string;
      risk?: "Low" | "Moderate" | "High" | string;
    };
  };
  questionsForGP?: string[];
  redFlags?: string[];
  isRedFlag?: boolean;
  signalsIdentified?: string[];
  systemsAffected?: string[];
  gpSummary?: {
    symptoms?: string;
    severity?: string;
    duration?: string;
    riskLevel?: string;
    redFlag?: string;
    suggestedNextStep?: string;
  };
  safetyNetting?: string;
};

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const hasGroqKey = Boolean(GROQ_API_KEY && GROQ_API_KEY !== "your_key_here");

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

function nhsSelfCareContext(input: ReasoningInput): string {
  if (!input.analysis.nhsSelfCare.length) {
    return "No specific NHS self-care snippets are available for the selected symptoms. Use only the matched NHS reference URLs and general safety-netting.";
  }

  return input.analysis.nhsSelfCare.map((advice) => `
${advice.label}
Source: ${advice.sourceUrl}
NHS self-care points:
${advice.selfCare.map((item) => `- ${item}`).join("\n")}
NHS seek-help points:
${advice.seekHelp.map((item) => `- ${item}`).join("\n")}
`).join("\n");
}

function severityToScore(severity: AnalysisResult["severity"]): number {
  if (severity === "severe") return 9;
  if (severity === "moderate") return 6;
  return 3;
}

function parseMetricNumber(value?: string): number | null {
  if (!value) return null;
  const match = value.match(/[\d.]+/);
  return match ? Number(match[0]) : null;
}

function buildGroqUserMessage(input: ReasoningInput): string {
  const metrics = input.healthData?.metrics;
  const visualConcern = input.scan?.visualConcernLevel || "low";
  const concernScore = visualConcern === "high" ? 80 : visualConcern === "moderate" ? 55 : 20;
  const facialAsymmetry = visualConcern === "high" ? 0.16 : visualConcern === "moderate" ? 0.09 : 0.03;
  const scanObservationCount = input.scan?.observations.length || 0;
  const recovery = parseMetricNumber(metrics?.recovery);
  const sleep = parseMetricNumber(metrics?.sleep);
  const hrv = parseMetricNumber(metrics?.hrv);
  const steps = metrics?.steps ? parseInt(metrics.steps.replace(/[^\d]/g, ""), 10) : null;
  const restingHR = parseMetricNumber(metrics?.heartRate);

  return `Please analyse the following wellness data:

SYMPTOMS:
- Reported symptoms: ${input.analysis.selectedSymptomLabels.join(", ")}
- Duration: ${input.analysis.duration || "Not specified"}
- Severity: ${severityToScore(input.analysis.severity)}/10

FACIAL WELLNESS SCAN:
- Eye openness score: ${scanObservationCount > 0 ? "visible cues recorded" : "not available"}
- Blink rate: not available bpm
- Facial asymmetry: ${facialAsymmetry}
- Fatigue score: ${concernScore}/100
- Head tilt: not available degrees
- Scan quality: ${input.scan?.scanQuality || "not supplied"}
- Facial scan observations: ${input.scan?.observations.map((observation) => observation.label).join("; ") || "none supplied"}

WEARABLE / HEALTH DATA:
- Resting heart rate: ${restingHR ?? "not available"} bpm
- Sleep last night: ${sleep ?? "not available"} hours
- Recovery / readiness: ${recovery ?? "not available"}%
- HRV: ${hrv ?? "not available"}ms
- Steps today: ${steps ?? "not available"}
- Activity level: ${metrics?.activity || "not available"}

USER PROFILE:
- Age: not provided

NHS SELF-CARE SOURCE CONTEXT:
${nhsSelfCareContext(input)}`;
}

async function callGroq(messages: GroqChatMessage[], maxTokens = 1000): Promise<string> {
  const response = await fetch(GROQ_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      max_tokens: maxTokens,
      messages,
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq request failed: ${response.status}`);
  }

  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content;
  if (typeof rawText !== "string") {
    throw new Error("Groq response did not include message content");
  }

  return rawText;
}

async function callGroqReport(input: ReasoningInput): Promise<GroqKashfReport> {
  const rawText = await callGroq([
    { role: "system", content: KASHF_SYSTEM_PROMPT },
    { role: "user", content: buildGroqUserMessage(input) },
  ]);
  const clean = rawText.replace(/```json|```/g, "").trim();
  return JSON.parse(clean) as GroqKashfReport;
}

function mapGroqReportToTailoredInsight(report: GroqKashfReport, input: ReasoningInput): TailoredInsight {
  const fallback = generateHeuristicFallbackSync(input);
  const facialSignals = report.facialSignals || [];
  const wearableInsights = report.wearableInsights || [];
  const redFlags = report.redFlags || [];
  const whySuggested = [
    ...(report.signalsIdentified || []),
    ...facialSignals,
    ...wearableInsights,
    ...redFlags,
  ].filter(Boolean);

  return {
    clinicalNarrative: report.tailoredPerspective || report.riskReason || fallback.clinicalNarrative,
    dynamicGPQuestions: report.questionsForGP?.length ? report.questionsForGP : fallback.dynamicGPQuestions,
    systemCorrelations: report.systemCorrelations?.length ? report.systemCorrelations : fallback.systemCorrelations,
    personalizedAdvice: report.recommendedActionText || fallback.personalizedAdvice,
    nhsSelfCareRecommendations: report.nhsSelfCareGuidance?.length
      ? report.nhsSelfCareGuidance
      : fallback.nhsSelfCareRecommendations,
    nextStep: report.recommendedActionText || fallback.nextStep,
    careImpact: {
      actNow: report.careImpactDashboard?.ifActNow?.length
        ? report.careImpactDashboard.ifActNow
        : fallback.careImpact.actNow,
      delayed: report.careImpactDashboard?.ifDelayed?.length
        ? report.careImpactDashboard.ifDelayed
        : fallback.careImpact.delayed,
      impact: {
        time: report.careImpactDashboard?.estimatedImpact?.time || fallback.careImpact.impact.time,
        complexity: report.careImpactDashboard?.estimatedImpact?.care || fallback.careImpact.impact.complexity,
        escalation: report.careImpactDashboard?.estimatedImpact?.risk || fallback.careImpact.impact.escalation,
      },
    },
    whySuggested: whySuggested.length ? whySuggested : fallback.whySuggested,
    biggerPicture: report.systemsAffected?.length ? report.systemsAffected : fallback.biggerPicture,
  };
}

export async function generateTailoredInsight(input: ReasoningInput): Promise<TailoredInsight> {
  if (!hasGroqKey) {
    console.warn("[AI Reasoning Engine] No Groq API key found. Using heuristic fallback.");
    return generateHeuristicFallback(input);
  }

  try {
    const groqReport = await callGroqReport(input);
    return mapGroqReportToTailoredInsight(groqReport, input);
  } catch (error) {
    console.error("[AI Reasoning Engine] Groq processing error. Falling back to heuristics.", error);
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

  if (!hasGroqKey) {
    return translateText(generateChatFallback(input, latestUserMessage, tailoredInsight), language);
  }
  const selectedLanguage = selectedLanguageName(language);
  const chatTailoredInsight = tailoredInsight
    ? { ...tailoredInsight, personalizedAdvice: tailoredInsight.nextStep }
    : null;
  const kashfReport = {
    riskLevel: input.analysis.riskLevel,
    riskLabel: input.analysis.riskLabel,
    riskReason: input.analysis.riskSummary,
    symptoms: input.analysis.selectedSymptomLabels,
    severity: input.analysis.severity,
    duration: input.analysis.duration,
    nhsReferences: input.analysis.nhsReferences,
    nhsSelfCare: input.analysis.nhsSelfCare,
    facialScan: input.scan ? {
      scanQuality: input.scan.scanQuality,
      visualConcernLevel: input.scan.visualConcernLevel,
      observations: input.scan.observations,
    } : null,
    healthData: input.healthData,
    tailoredInsight: chatTailoredInsight,
  };

  const conversation = messages
    .slice(-8)
    .map((message) => `${message.role === "user" ? "User" : "Kashf"}: ${message.content}`)
    .join("\n");

  const chatSystemPrompt = `
You are Kashf Assistant, a friendly wellness guidance chatbot.

IMPORTANT: You must respond ENTIRELY and ONLY in ${selectedLanguage}. Every word of your response must be in ${selectedLanguage}.
Do not mix languages. Do not include any other language in your response.

The user's assessment report:
${JSON.stringify(kashfReport)}

Rules:
- Never diagnose
- Use NHS UK terms translated into ${selectedLanguage}
- Stay calm and supportive
- If chest pain, breathing difficulty or stroke symptoms are mentioned, tell user to call 999 or go to A&E, translated into ${selectedLanguage}
- Keep responses concise and clear
- Do not append the safety netting disclaimer to message bubbles; the UI displays it separately
${localisedPromptSuffix(language)}
`;

  const prompt = `
Assessment context:
${describePatientContext(input)}

Conversation so far:
${conversation}

NHS symptom references:
${input.analysis.nhsReferences.map((reference) => `- ${reference.label}: ${reference.url}`).join("\n") || "- https://www.nhs.uk/symptoms/"}

NHS self-care source context:
${nhsSelfCareContext(input)}

Return plain text only. Do not use markdown tables. Answer the latest user message using only the assessment context.
`;

  try {
    return (await callGroq([
      { role: "system", content: chatSystemPrompt },
      { role: "user", content: prompt },
    ], 700)).trim();
  } catch (error) {
    console.error("[AI Chat Assistant] Groq processing error. Falling back to heuristics.", error);
    return translateText(generateChatFallback(input, latestUserMessage, tailoredInsight), language);
  }
}

async function generateHeuristicFallback(input: ReasoningInput): Promise<TailoredInsight> {
  return generateHeuristicFallbackSync(input);
}

function generateHeuristicFallbackSync(input: ReasoningInput): TailoredInsight {
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

  const nextStep =
    risk === "urgent"
      ? "Call 999 or go to A&E now if symptoms are severe, sudden, or worsening."
      : risk === "moderate"
        ? "Consider contacting your GP or NHS 111, especially if symptoms continue or worsen."
      : "Monitor your symptoms and consider a pharmacist, GP, or NHS 111 if you are unsure or symptoms change.";
  const nhsSelfCareRecommendations = analysis.nhsSelfCare.length
    ? analysis.nhsSelfCare.flatMap((advice) => advice.selfCare.slice(0, 2)).slice(0, 5)
    : [
        "Use the matched NHS reference links for symptom-specific self-care advice.",
        "If symptoms are severe, sudden, worsening, or worrying, seek medical advice rather than relying on this check.",
      ];
  const hasScanConcern = scan?.visualConcernLevel && scan.visualConcernLevel !== "low";
  const impact = {
    time: risk === "urgent" ? "High" : risk === "moderate" ? "1-2 days" : "Minimal",
    complexity: risk === "urgent" || hasScanConcern ? "High" : risk === "moderate" ? "Moderate" : "Low",
    escalation: risk === "urgent" || hasScanConcern ? "High" : risk === "moderate" ? "Moderate" : "Low",
  };

  return {
    clinicalNarrative: `Your report of ${symptoms.join(", ") || "no selected symptoms"} suggests ${analysis.riskLabel.toLowerCase()} based on this check. Kashf has combined your symptom input with ${healthData ? "connected health signals" : "available health context"} and ${scan ? "visible facial wellness signals" : "any facial scan context"} as supporting information, not as a diagnosis.`,
    dynamicGPQuestions: Array.from(new Set(dynamicGPQuestions)),
    systemCorrelations: correlations,
    personalizedAdvice: nextStep,
    nhsSelfCareRecommendations,
    nextStep,
    careImpact: {
      actNow: risk === "urgent"
        ? ["Urgent services can assess serious symptoms quickly.", "Clearer next steps may reduce the chance of deterioration."]
        : ["You may get reassurance sooner.", "A GP, pharmacist, or NHS 111 can help decide whether monitoring is enough."],
      delayed: risk === "urgent"
        ? ["Potentially serious symptoms could worsen.", "Care may become more complex if urgent signs are ignored."]
        : ["Symptoms may persist or become harder to interpret.", "You may miss the chance to share a clear symptom history early."],
      impact,
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
  const nhsMatches = findNhsReferencesForText(latestUserMessage);
  const activeReferences = nhsMatches.length > 0 ? nhsMatches : input.analysis.nhsReferences;

  if (activeReferences.length > 0 && (question.includes("symptom") || question.includes("nhs") || nhsMatches.length > 0 || question.includes("why") || question.includes("what is"))) {
    const referenceText = activeReferences.map((reference) => `${reference.label}: ${reference.url}`).join("; ");
    const selfCare = tailoredInsight?.nhsSelfCareRecommendations?.length
      ? ` NHS-based self-care points shown in your report include: ${tailoredInsight.nhsSelfCareRecommendations.slice(0, 3).join(" ")}`
      : "";
    const contextNote = nhsMatches.length > 0
      ? "I matched your question to the NHS Symptoms A to Z reference list."
      : "I matched your submitted symptoms to the NHS Symptoms A to Z reference list.";
    return `${contextNote} Relevant NHS reference(s): ${referenceText}.${selfCare} Based on your submitted assessment, the next step is: ${nextStep}`;
  }

  if (question.includes("gp") || question.includes("doctor")) {
    const gpQuestions = tailoredInsight?.dynamicGPQuestions || input.analysis.gpQuestions;
    return `For your GP, mention ${symptoms}, the duration (${input.analysis.duration || "not specified"}), severity (${input.analysis.severity}), and any connected health or facial wellness observations. Useful questions include: ${gpQuestions.slice(0, 3).join(" ")}`;
  }

  if (question.includes("face") || question.includes("scan")) {
    const observations = input.scan?.observations.map((observation) => observation.label).join(", ") || "no completed facial scan";
    return `The facial scan is treated only as visible wellness context. It noted ${observations}, but this cannot diagnose a condition. The symptom input remains the main basis for the guidance.`;
  }

  if (question.includes("health") || question.includes("sleep") || question.includes("heart") || question.includes("recovery")) {
    const metrics = input.healthData?.metrics;
    if (!metrics) {
      return "No connected health data was supplied for this result, so the guidance is based mainly on your symptom answers.";
    }
    return `Your connected health data adds context: heart rate ${metrics.heartRate}, sleep ${metrics.sleep}, recovery ${metrics.recovery}, HRV ${metrics.hrv}, and steps ${metrics.steps}. Share these with a GP or NHS 111 if you seek advice.`;
  }

  if (question.includes("next") || question.includes("what should")) {
    const selfCare = tailoredInsight?.nhsSelfCareRecommendations?.length
      ? ` NHS-based self-care guidance in your report includes: ${tailoredInsight.nhsSelfCareRecommendations.slice(0, 3).join(" ")}`
      : "";
    return `The suggested next step is: ${nextStep} This is based on ${symptoms}, severity ${input.analysis.severity}, and duration ${input.analysis.duration || "not specified"}.${selfCare}`;
  }

  return `Based on this result, Kashf is linking ${symptoms} with any connected health data and visible wellness scan context to suggest: ${nextStep}`;
}
