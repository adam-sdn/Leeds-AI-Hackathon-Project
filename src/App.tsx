import { useState, useEffect } from "react";
import { analyzeSymptoms } from "./utils/riskEngine";
import type { AnalysisResult } from "./utils/riskEngine";
import { SymptomForm } from "./components/SymptomForm";
import ResultsDashboard from "./components/ResultsDashboard";
import RedFlagAlert from "./components/RedFlagAlert";
import FaceScan from "./components/FaceScan";
import AccessibilityMenu from "./components/AccessibilityMenu";
import HealthDataConnect from "./components/HealthDataConnect";
import type { FaceScanResult } from "./components/FaceScan";
import "./App.css";

type Severity = "mild" | "moderate" | "severe";
type View = 'health' | 'form' | 'scan';

interface AnalyzePayload {
  symptoms: string[];
  severity: Severity;
  duration: string;
}

function App() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [view, setView] = useState<View>('health');
  const [scanResult, setScanResult] = useState<FaceScanResult | null>(null);
  const [healthData, setHealthData] = useState<any | null>(null);
  
  const [accSettings, setAccSettings] = useState({
    highContrast: false,
    largeText: false,
    colourBlindSafe: false
  });

  const handleToggleAcc = (key: 'highContrast' | 'largeText' | 'colourBlindSafe') => {
    setAccSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleHealthComplete = (data?: any) => {
    if (data) setHealthData(data);
    setView('form');
  };

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
    setView('health');
  }

  return (
    <div 
      className="app-shell"
      data-high-contrast={accSettings.highContrast}
      data-large-text={accSettings.largeText}
      data-colour-blind={accSettings.colourBlindSafe}
    >
      <header className="header">
        <div className="brand-header-group" onClick={handleReset}>
          <div className="brand-mark">K</div>
          <span className="brand-text">kashf<span className="brand-dot">.ai</span></span>
        </div>

        <div className="header-nav" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <AccessibilityMenu settings={accSettings} onToggle={handleToggleAcc} />
          
          <button 
            className={`nav-btn ${view === 'scan' ? 'nav-btn--active' : ''}`}
            onClick={() => { setView(view === 'scan' ? 'form' : 'scan'); setResult(null); }}
          >
            {view === 'scan' ? 'Symptom Check' : 'Try Face Wellness'}
          </button>
        </div>
      </header>

      <main className="app-main">
        {view === 'health' ? (
          <HealthDataConnect onComplete={handleHealthComplete} />
        ) : view === 'scan' ? (
          <div className="scan-view animate-fade">
            <FaceScan onScanComplete={(res) => setScanResult(res)} />
            <button className="btn-secondary" style={{marginTop: '24px'}} onClick={() => setView('form')}>
              ← Back to Symptom Check
            </button>
          </div>
        ) : !result ? (
          <div className="form-view animate-fade">
            <div className="page-intro">
              <h1 className="page-title">How are you feeling?</h1>
              <p className="page-sub">
                Select your symptoms below and we'll help you understand what to do next.
              </p>
            </div>
            <SymptomForm onAnalyze={handleAnalyze} />
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
                onStartAgain={handleReset} 
                onRescanFace={() => setView('scan')}
              />
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