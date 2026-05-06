import { useState } from "react";
import { analyzeSymptoms } from "./utils/riskEngine";
import type { AnalysisResult } from "./utils/riskEngine";
import { SymptomForm } from "./components/SymptomForm";
import ResultsDashboard from "./components/ResultsDashboard";
import RedFlagAlert from "./components/RedFlagAlert";
import FaceScan from "./components/FaceScan";
import HealthDataConnect from "./components/HealthDataConnect";
import ResultsLoadingTerminal from "./components/ResultsLoadingTerminal";
import LanguageRefreshOverlay from "./components/LanguageRefreshOverlay";
import InteractiveHero from "./components/ui/hero-section-nexus";
import type { FaceScanResult } from "./components/FaceScan";
import type { ConnectedHealthData } from "./types/health";
import { languageLabels } from "./types/language";
import type { AppLanguage } from "./types/language";
import { uiText } from "./utils/i18n";
import "./App.css";

type Severity = "mild" | "moderate" | "severe";
type View = "home" | "health" | "form" | "scan";

interface AnalyzePayload {
  symptoms: string[];
  severity: Severity;
  duration: string;
}

function App() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [view, setView] = useState<View>("home");
  const [scanResult, setScanResult] = useState<FaceScanResult | null>(null);
  const [healthData, setHealthData] = useState<ConnectedHealthData | null>(null);
  const [language, setLanguage] = useState<AppLanguage>("en");
  const [isRefreshingLanguage, setIsRefreshingLanguage] = useState(false);
  const [isPreparingResults, setIsPreparingResults] = useState(false);
  const [isStartingAnalysis, setIsStartingAnalysis] = useState(false);

  const handleHealthComplete = (data?: ConnectedHealthData) => {
    if (data) setHealthData(data);
    setView("form");
  };

  function handleAnalyze(data: AnalyzePayload) {
    const analysis = analyzeSymptoms({
      selectedSymptoms: data.symptoms,
      severity: data.severity,
      duration: data.duration,
    });

    setIsPreparingResults(true);
    window.setTimeout(() => {
      setResult(analysis);
      setIsPreparingResults(false);
    }, 4700);
  }

  function handleReset() {
    setResult(null);
    setIsPreparingResults(false);
    setIsStartingAnalysis(false);
    setView("scan");
  }

  function handleReturnHome() {
    setResult(null);
    setIsPreparingResults(false);
    setIsStartingAnalysis(false);
    setView("home");
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
  }

  function handleStartAnalysis() {
    setResult(null);
    setIsPreparingResults(false);
    setIsStartingAnalysis(true);
    window.setTimeout(() => {
      setView("scan");
      window.setTimeout(() => setIsStartingAnalysis(false), 450);
    }, 850);
  }

  function handleLanguageChange(nextLanguage: AppLanguage) {
    if (nextLanguage === language) return;
    setIsRefreshingLanguage(true);
    window.setTimeout(() => {
      setLanguage(nextLanguage);
      window.setTimeout(() => setIsRefreshingLanguage(false), 700);
    }, 250);
  }

  return (
    <div
      className="app-shell"
      data-theme="dark"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      {view !== "home" && (
      <header className="header">
        <div className="brand-header-group" onClick={handleReturnHome}>
          <div className="brand-mark">K</div>
          <span className="brand-text">
            kashf<span className="brand-dot">.ai</span>
          </span>
        </div>

        <div className="header-nav">
          <label className="language-control">
            <span className="language-control__label">Language</span>
            <span className="language-control__wash" aria-hidden="true" />
            <span className="language-control__gradient" aria-hidden="true" />
            <select
              className="language-select"
              value={language}
              onChange={(event) => handleLanguageChange(event.target.value as AppLanguage)}
              aria-label="Select report and chat language"
            >
              {Object.entries(languageLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
        </div>
      </header>
      )}

      {isStartingAnalysis && (
        <LanguageRefreshOverlay
          language={language}
          message="Preparing Face Scan Wellness Check"
          label="Kashf.ai"
        />
      )}

      <main className={view === "home" ? "app-main app-main--home" : "app-main"}>
        {isRefreshingLanguage && <LanguageRefreshOverlay language={language} />}
        {view === "home" ? (
          <InteractiveHero onStartAnalysis={handleStartAnalysis} />
        ) : isPreparingResults ? (
          <ResultsLoadingTerminal />
        ) : view === "health" ? (
          <HealthDataConnect onComplete={handleHealthComplete} language={language} />
        ) : view === "scan" ? (
          <div className="scan-view animate-fade">
            <FaceScan onScanComplete={(res) => setScanResult(res)} language={language} />
            <button
              className="btn-secondary"
              style={{
                marginTop: "24px",
                opacity: scanResult ? 1 : 0.56,
                cursor: scanResult ? "pointer" : "not-allowed",
              }}
              onClick={() => {
                if (scanResult) setView("health");
              }}
              disabled={!scanResult}
              type="button"
            >
              {scanResult ? uiText(language, "continueHealth") : "Complete face scan to continue"}
            </button>
          </div>
        ) : !result ? (
          <div className="form-view animate-fade">
            <div className="page-intro">
              <h1 className="page-title">{uiText(language, "howFeeling")}</h1>
              <p className="page-sub">
                {uiText(language, "howFeelingSub")}
              </p>
            </div>
            <SymptomForm onAnalyze={handleAnalyze} language={language} />
          </div>
        ) : (
          <div className="results-container animate-fade">
            {result.isRedFlag ? (
              <RedFlagAlert onStartAgain={handleReset} />
            ) : (
              <ResultsDashboard
                result={result}
                scanResult={scanResult}
                healthData={healthData}
                language={language}
                onStartAgain={handleReset}
                onRescanFace={() => setView("scan")}
              />
            )}
          </div>
        )}
      </main>

      {view !== "home" && (
      <footer className="app-footer">
        <p>Kashf.ai - Not a medical service - For guidance only</p>
      </footer>
      )}
    </div>
  );
}

export default App;
