import { useState } from "react";
import { analyzeSymptoms } from "./utils/riskEngine";
import type { AnalysisResult } from "./utils/riskEngine";
import { SymptomForm } from "./components/SymptomForm";
import ResultsDashboard from "./components/ResultsDashboard";
import RedFlagAlert from "./components/RedFlagAlert";
import "./App.css";

type Severity = "mild" | "moderate" | "severe";

interface AnalyzePayload {
  symptoms: string[];
  severity: Severity;
  duration: string;
}

function App() {
  const [result, setResult] = useState<AnalysisResult | null>(null);

  function handleAnalyze(data: AnalyzePayload) {
    const analysis = analyzeSymptoms({
      selectedSymptoms: data.symptoms,
      severity: data.severity,
      duration: data.duration,
    });
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
          <div className="results-container">
            {result.isRedFlag ? (
              <RedFlagAlert onStartAgain={handleReset} />
            ) : (
              <ResultsDashboard result={result} onStartAgain={handleReset} />
            )}
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Kashf.ai · Not a medical service · For guidance only</p>
      </footer>
    </div>
  );
}

export default App;