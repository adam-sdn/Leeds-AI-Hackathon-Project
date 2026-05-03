# Kashf.ai — كشف
### *Privacy-first wellness triage. Your body is already telling you something. We help you hear it.*

![Risk Level](https://img.shields.io/badge/Risk%20Levels-Low%20%7C%20Moderate%20%7C%20Urgent-0A7C6E)
![BrowserPod](https://img.shields.io/badge/Powered%20by-BrowserPod-black)
![AI](https://img.shields.io/badge/AI-Llama%203.3%2070B%20via%20Groq-orange)
![Privacy](https://img.shields.io/badge/Privacy-100%25%20Local%20Processing-green)
![Hackathon](https://img.shields.io/badge/Leaning%20Technologies-Hackathon%202026-blue)

---

## What is Kashf?

**Kashf** (كشف) is Arabic for *discovery*. Kashf.ai is a privacy-first wellness triage web application that helps users make clearer, more informed health decisions by combining three data sources into a single, easy-to-understand experience:

- 🩺 **Symptom input** — what you're feeling, how long, how severe
- 📷 **Facial wellness scan** — browser-based computer vision via MediaPipe Face Mesh
- ⌚ **Health app & wearable signals** — heart rate, sleep, HRV, recovery, steps

All processing happens **locally in the browser** using BrowserPod. Sensitive health and camera data never leave your device.

> Kashf is not a diagnostic tool. It is a supportive decision companion — helping users navigate uncertainty, understand their situation more clearly, and take the next step with confidence.

---

## Built With

| Technology | Purpose |
|---|---|
| **BrowserPod** (Leaning Technologies) | Local sandboxed execution — all data stays in browser |
| **Llama 3.3 70B via Groq API** | AI wellness analysis engine |
| **MediaPipe Face Mesh** | Browser-based facial wellness scan |
| **React + Vite** | Frontend application |
| **Font Awesome 6.5** | Brand icons for health platform tiles |
| **NHS A to Z Symptom Index** | Matched NHS guidance and links |

---

## Features

### Three-Signal Analysis
Kashf combines symptom data, facial wellness observations, and wearable health metrics into a unified AI assessment — producing a clear risk level and recommended next step.

### 📷 Facial Wellness Scan
Using MediaPipe Face Mesh in the browser, Kashf analyses:
- Eye openness and blink rate (fatigue indicators)
- Facial asymmetry (stroke red-flag screening)
- Head position and tilt
- Skin tone variance (redness/pallor estimates)

All framed as *visible wellness signals*, never as clinical diagnosis.

### ⌚ Health Data Integration
Supports simulated health profiles representing data from:
- Apple Health
- Google Fit
- Samsung Health
- WHOOP
- Fitbit
- Garmin

In production, real data would connect via each platform's official API (OAuth 2.0 for WHOOP/Fitbit, HealthKit for iOS, Health Connect for Android).

### 🤖 AI Assessment Engine
Powered by Llama 3.3 70B via Groq, the engine produces:
- Risk level: **Low / Moderate / Urgent**
- Tailored wellness perspective combining all three signals
- System correlations (e.g. sleep duration linked to reported fatigue)
- NHS A to Z matched symptom links
- NHS-style self-care guidance
- Care impact dashboard (act now vs delay)
- Questions to ask your GP
- GP-ready summary
- Red flag escalation for emergency symptoms

### 📄 Privacy-First PDF Report
Generated entirely inside a BrowserPod sandbox using Node.js — the report is built locally and downloaded directly. It includes all dashboard sections in a clean, GP-friendly format the user can bring to an appointment.

### 💬 Multilingual Chatbot
A Kashf Assistant chatbot (bottom-right) powered by Llama 4 Scout supports follow-up questions in:
- 🇬🇧 English
- 🇸🇦 Arabic (RTL layout)
- 🇫🇷 French
- 🇪🇸 Spanish
- 🇨🇳 Mandarin
- 🇮🇳 Punjabi

### 🔴 Emergency Escalation
If red flag symptoms are detected (chest pain, stroke signals, facial asymmetry above threshold, difficulty breathing), Kashf immediately surfaces an urgent banner:
> *"These signals need immediate attention. Please call 999 or go to A&E now."*

---

## App Flow

```
Landing Screen
      ↓
Symptom Input
(symptoms, severity, duration, age)
      ↓
Connect Health Data
(select platform → demo profile loads)
      ↓
Facial Wellness Scan
(MediaPipe, 10 seconds, optional)
      ↓
AI Analysis Loading
("Kashf is analysing your signals...")
      ↓
Results Dashboard
(risk level, insights, NHS links, GP summary)
      ↓
Download PDF Report
(generated locally via BrowserPod)
```

---

## Privacy Architecture

```
┌─────────────────────────────────────────┐
│           BROWSER (User Device)         │
│                                         │
│  Symptom input                          │
│  Health data simulation                 │
│  MediaPipe facial scan (WASM)           │
│  Results dashboard                      │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │        BrowserPod Sandbox         │  │
│  │                                   │  │
│  │  Node.js PDF generation           │  │
│  │  Risk scoring logic               │  │
│  │  All sensitive data stays here    │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
           │
           │ Only the AI analysis request
           │ (no camera or health data)
           ↓
     Groq API → Llama 3.3 70B
```

The facial scan, health metrics, and symptom data are **never transmitted** to any external server. Only the structured text summary is sent to Groq for AI analysis.

---

## NHS Compliance

Kashf.ai follows NHS-style patient safety guidance throughout:

- Uses UK terminology: GP, NHS 111, 999, A&E, pharmacist
- Matches symptoms to the NHS A to Z index with direct links
- Generates questions the user can ask their GP
- Includes safety-netting on every assessment:
  > *"This is not a medical diagnosis. If your symptoms are severe, sudden, worsening, or you are worried, seek medical advice. If you have chest pain, difficulty breathing, signs of stroke, or feel seriously unwell, call 999 or go to A&E."*
- Red flags trigger immediate urgent escalation

---

## Judging Criteria Addressed

| Criterion | How Kashf addresses it |
|---|---|
| **Creativity & Innovation** | First app to combine facial scan + wearables + symptoms with full local processing |
| **Technical Sophistication** | BrowserPod sandbox, MediaPipe WASM, Groq/Llama AI, multilingual chatbot |
| **Social & Global Impact** | Helps users who can't easily access a GP make informed triage decisions |
| **Design & UX** | Card-based, colour-coded, accessible, mobile responsive |
| **Sustainability** | BrowserPod eliminates per-session cloud compute costs entirely |
| **Accessibility & Healthcare** | Multilingual support, NHS-aligned, screen-reader friendly |
| **Software Security** | Zero data transmission of health/camera data, BrowserPod isolation |

---

## Getting Started

### Prerequisites
- Node.js 18+
- A Groq API key (free at [console.groq.com](https://console.groq.com))
- A BrowserPod API key (free at [console.browserpod.io](https://console.browserpod.io))

### Installation

```bash
git clone https://github.com/adam-sdn/Leeds-AI-Hackathon-Project.git
cd Leeds-AI-Hackathon-Project
npm install
```

### Environment Setup

Create a `.env` file in the root directory:

```env
VITE_GROQ_API_KEY=your_groq_api_key_here
VITE_BROWSERPOD_API_KEY=your_browserpod_api_key_here
```

### Run Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

---

## Project Structure

```
kashf-ai/
├── src/
│   ├── components/
│   │   ├── LandingScreen.jsx
│   │   ├── SymptomInput.jsx
│   │   ├── HealthDataConnect.jsx
│   │   ├── FacialScan.jsx
│   │   ├── LoadingScreen.jsx
│   │   ├── ResultsDashboard.jsx
│   │   └── ChatBot.jsx
│   ├── utils/
│   │   ├── kashfPrompt.js      ← Groq system prompt
│   │   ├── groqClient.js       ← Llama API integration
│   │   ├── pdfGenerator.js     ← BrowserPod PDF generation
│   │   └── mediapipe.js        ← Facial scan logic
│   └── App.jsx
├── public/
├── .env
├── index.html
└── README.md
```

---

## Disclaimer

Kashf.ai is a wellness triage support tool built for a hackathon. It is not a medical device, does not provide medical diagnoses, and does not replace professional medical advice. Always consult a qualified healthcare professional for medical concerns. In an emergency, call 999 or go to A&E.

---

## Author

Built solo by **Adam** for the Leaning Technologies Hackathon 2025.

*"Kashf — from the Arabic for discovery. Because your body is already telling you something. We just help you hear it."*
```
