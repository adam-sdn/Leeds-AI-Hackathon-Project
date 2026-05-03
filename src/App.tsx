import { useState } from "react";
import { analyzeSymptoms } from "./utils/riskEngine";
import type { AnalysisResult } from "./utils/riskEngine";
import { SymptomForm } from "./components/SymptomForm";
import ResultsDashboard from "./components/ResultsDashboard";
import RedFlagAlert from "./components/RedFlagAlert";
import FaceScan from "./components/FaceScan";
import AccessibilityMenu from "./components/AccessibilityMenu";
import HealthDataConnect from "./components/HealthDataConnect";
import ResultsLoadingTerminal from "./components/ResultsLoadingTerminal";
import LanguageRefreshOverlay from "./components/LanguageRefreshOverlay";
import type { FaceScanResult } from "./components/FaceScan";
import type { ConnectedHealthData } from "./types/health";
import { languageLabels } from "./types/language";
import type { AppLanguage } from "./types/language";
import { uiText } from "./utils/i18n";
import "./App.css";

type Severity = "mild" | "moderate" | "severe";
type View = "health" | "form" | "scan";

interface AnalyzePayload {
  symptoms: string[];
  severity: Severity;
  duration: string;
}

function App() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [view, setView] = useState<View>("scan");
  const [scanResult, setScanResult] = useState<FaceScanResult | null>(null);
  const [healthData, setHealthData] = useState<ConnectedHealthData | null>(null);
  const [language, setLanguage] = useState<AppLanguage>("en");
  const [isRefreshingLanguage, setIsRefreshingLanguage] = useState(false);
  const [isPreparingResults, setIsPreparingResults] = useState(false);

  const [accSettings, setAccSettings] = useState({
    highContrast: false,
    largeText: false,
    colourBlindSafe: false,
  });

  const handleToggleAcc = (key: "highContrast" | "largeText" | "colourBlindSafe") => {
    setAccSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

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
    setView("scan");
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
      data-high-contrast={accSettings.highContrast}
      data-large-text={accSettings.largeText}
      data-colour-blind={accSettings.colourBlindSafe}
      data-theme="dark"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <header className="header">
        <div className="brand-header-group" onClick={handleReset}>
          <div className="brand-mark">K</div>
          <span className="brand-text">
            kashf<span className="brand-dot">.ai</span>
          </span>
        </div>

        <div className="header-nav">
          <AccessibilityMenu settings={accSettings} onToggle={handleToggleAcc} language={language} />

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

          <button
            className={`nav-btn ${view === "scan" ? "nav-btn--active" : ""}`}
            onClick={() => {
              setView("scan");
              setResult(null);
              setIsPreparingResults(false);
            }}
            type="button"
          >
            {uiText(language, "faceScan")}
          </button>
        </div>
      </header>

      <main className="app-main">
        {isRefreshingLanguage && <LanguageRefreshOverlay language={language} />}
        {isPreparingResults ? (
          <ResultsLoadingTerminal />
        ) : view === "health" ? (
          <HealthDataConnect onComplete={handleHealthComplete} language={language} />
        ) : view === "scan" ? (
          <div className="scan-view animate-fade">
            <FaceScan onScanComplete={(res) => setScanResult(res)} language={language} />
            <button className="btn-secondary" style={{ marginTop: "24px" }} onClick={() => setView("health")}>
              {uiText(language, "continueHealth")}
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

      <footer className="app-footer">
        <p>Kashf.ai - Not a medical service - For guidance only</p>
      </footer>
    </div>
  );
}

export default App;
