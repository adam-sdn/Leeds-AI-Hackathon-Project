import { useState } from "react";
import { analyzeSymptoms } from "./utils/riskEngine";
import { SymptomForm } from "./components/SymptomForm";
import { ResultScreen } from "./components/ResultScreen";
import "./App.css";

type Severity = "mild" | "moderate" | "severe";

interface AnalyzePayload {
  symptoms: string[];
  severity: Severity;
  duration: string;
}

type AnalysisResult = ReturnType<typeof analyzeSymptoms>;

function App() {
  const [result, setResult] = useState<AnalysisResult | null>(null);

  function handleAnalyze(data: AnalyzePayload) {
    const analysis = analyzeSymptoms(data.symptoms, data.severity, data.duration);
    setResult(analysis);
  }

  function handleReset() {
    setResult(null);
  }

  return (
    <div className="app-shell">
      <header className="header">
        <div className="brand-mark">K</div>
        <span className="brand-text">kashf<span className="brand-dot">.ai</span></span>
      </header>

      <main className="app-main">
        {!result ? (
          <>
            <div className="page-intro">
              <h1 className="page-title">How are you feeling?</h1>
              <p className="page-sub">
                Select your symptoms below and we'll help you understand what to do next.
              </p>
            </div>
            <SymptomForm onAnalyze={handleAnalyze} />
          </>
        ) : (
          <>
            <div className="page-intro">
              <h1 className="page-title">Your results</h1>
              <p className="page-sub">
                Here's what your symptoms may indicate. Review carefully.
              </p>
            </div>
            <ResultScreen result={result} onReset={handleReset} />
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>Kashf.ai · Not a medical service · For guidance only</p>
      </footer>
    </div>
  );
}

export default App;