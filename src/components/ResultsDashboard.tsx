import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import logo from "../assets/logo.png";
import type { AnalysisResult } from "../utils/riskEngine";
import type { FaceScanResult } from "./FaceScan";
import { generateTailoredInsight } from "../utils/aiReasoningEngine";
import type { TailoredInsight } from "../utils/aiReasoningEngine";

type Props = {
  result: AnalysisResult;
  scanResult?: FaceScanResult | null;
  healthData?: any | null;
  onStartAgain: () => void;
  onRescanFace?: () => void;
};

const getImpactData = (riskLevel: string) => {
  switch(riskLevel) {
    case 'low':
      return {
        actNow: ['Likely self-care or pharmacist advice', 'Minimal disruption'],
        delayed: ['Symptoms may persist slightly longer', 'Still low risk'],
        impact: { time: 'Minimal', complexity: 'Low', escalation: 'Low' }
      };
    case 'urgent':
      return {
        actNow: ['Immediate urgent care (A&E or 999)', 'Faster intervention'],
        delayed: ['Increased risk of complications', 'Higher stress and longer recovery'],
        impact: { time: 'High', complexity: 'High', escalation: 'High' }
      };
    case 'moderate':
    default:
      return {
        actNow: ['Likely GP consultation', 'Lower disruption and faster reassurance'],
        delayed: ['Possible escalation to urgent care', 'Increased stress and waiting time'],
        impact: { time: '1–2 days', complexity: 'Moderate', escalation: 'Moderate' }
      };
  }
};

const getHealthStatus = (label: string, value: string | number) => {
  const val = typeof value === 'string' ? parseFloat(value) : value;
  
  if (label === 'Heart Rate') {
    if (val > 100) return { color: '#EF4444', text: 'Elevated' };
    if (val >= 60 && val <= 80) return { color: '#22C55E', text: 'Normal range' };
  }
  if (label === 'Sleep') {
    if (val < 6) return { color: '#F59E0B', text: 'Below recommended' };
    if (val >= 7 && val <= 9) return { color: '#22C55E', text: 'Good' };
  }
  if (label === 'Recovery') {
    if (val < 40) return { color: '#EF4444', text: 'Low' };
    if (val >= 40 && val < 70) return { color: '#F59E0B', text: 'Moderate' };
    if (val >= 70) return { color: '#22C55E', text: 'High' };
  }
  if (label === 'HRV') {
    if (val < 40) return { color: '#F59E0B', text: 'Worth monitoring' };
  }
  if (label === 'Steps') {
    const sVal = typeof value === 'string' ? parseInt(value.replace(',', '')) : value;
    if (sVal >= 8000) return { color: '#22C55E', text: 'Active day' };
    if (sVal < 5000) return { color: '#F59E0B', text: 'Low movement today' };
  }
  return null;
};

export default function ResultsDashboard({ result, scanResult, healthData, onStartAgain, onRescanFace }: Props) {
  const impactData = getImpactData(result.riskLevel);
  const [tailoredInsight, setTailoredInsight] = useState<TailoredInsight | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(true);

  useEffect(() => {
    const synthesize = async () => {
      setIsLoadingAI(true);
      try {
        const insight = await generateTailoredInsight({
          analysis: result,
          scan: scanResult,
          healthData: healthData
        });
        setTailoredInsight(insight);
      } catch (err) {
        console.error("AI Synthesis failed:", err);
      } finally {
        setIsLoadingAI(false);
      }
    };
    synthesize();
  }, [result, scanResult, healthData]);

  const getAIInsight = () => {
    if (!healthData?.metrics) return null;
    const recovery = parseFloat(healthData.metrics.recovery);
    const rhr = parseFloat(healthData.metrics.heartRate);
    const hasFatigue = result.selectedSymptomLabels.some(s => s.toLowerCase().includes('fatigue') || s.toLowerCase().includes('tired'));
    
    if (recovery < 50 && hasFatigue) {
      return "Your recovery is below average and combined with reported fatigue, rest is strongly advised.";
    }
    if (rhr > 100) {
      return "Your resting heart rate is currently elevated; try to minimize physical exertion until you speak with a professional.";
    }
    return "Your health metrics provide additional context for your symptoms; be sure to share these with your GP.";
  };

  const aiInsight = getAIInsight();

  const downloadPDF = () => {
    const doc = new jsPDF();
    const margin = 15;
    const pageWidth = 210;
    const pageHeight = 297;
    const contentWidth = pageWidth - (margin * 2);
    const bottomMargin = 20;
    let y = 35;

    const ensureSpace = (requiredHeight: number) => {
      if (y + requiredHeight > pageHeight - bottomMargin) {
        doc.addPage();
        y = 20;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(15, 23, 42);
        doc.text("Kashf Care Summary (cont.)", margin, y);
        doc.addImage(logo, "PNG", pageWidth - 35, y - 5, 20, 7.5);
        y += 15;
      }
    };

    const addWrappedText = (text: string, x: number, maxWidth: number, lineHeight: number = 6) => {
      const lines = doc.splitTextToSize(text, maxWidth);
      ensureSpace(lines.length * lineHeight);
      doc.text(lines, x, y);
      y += lines.length * lineHeight;
    };

    const addBullet = (text: string) => {
      const bulletLineHeight = 6;
      const bulletX = margin;
      const textX = margin + 5;
      const textMaxWidth = contentWidth - 5;
      const lines = doc.splitTextToSize(text, textMaxWidth);
      ensureSpace(lines.length * bulletLineHeight);
      doc.text("•", bulletX, y);
      doc.text(lines, textX, y);
      y += lines.length * bulletLineHeight;
    };

    doc.addImage(logo, "PNG", pageWidth - 55, 10, 40, 15);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, 28, pageWidth - margin, 28);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(15, 23, 42);
    doc.text("Kashf Care Summary", margin, y);
    y += 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, margin, y);
    y += 15;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(15, 23, 42);
    doc.text("Risk Overview", margin, y);
    y += 8;

    doc.setFontSize(12);
    const riskColor = result.riskLevel === 'urgent' ? [239, 68, 68] : result.riskLevel === 'moderate' ? [245, 158, 11] : [34, 197, 94];
    doc.setTextColor(riskColor[0], riskColor[1], riskColor[2]);
    addBullet(result.riskLabel);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(51, 65, 85);
    y += 2;
    addWrappedText(result.riskSummary, margin, contentWidth);
    y += 8;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(15, 23, 42);
    doc.text("Recommended Next Step", margin, y);
    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    addWrappedText(result.recommendation, margin, contentWidth);
    y += 8;

    ensureSpace(30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(15, 23, 42);
    doc.text("Care Impact Overview", margin, y);
    y += 8;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("If you act now:", margin, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    impactData.actNow.forEach(item => { addBullet(item); y += 2; });
    
    y += 2;
    doc.setFont("helvetica", "bold");
    doc.text("If delayed:", margin, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    impactData.delayed.forEach(item => { addBullet(item); y += 2; });

    y += 2;
    doc.setFont("helvetica", "bold");
    doc.text("Estimated impact:", margin, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    addBullet(`Time disruption: ${impactData.impact.time}`);
    y += 2;
    addBullet(`Care complexity: ${impactData.impact.complexity}`);
    y += 2;
    addBullet(`Escalation risk: ${impactData.impact.escalation}`);
    y += 8;

    if (result.biggerPicture && result.biggerPicture.length > 0) {
      ensureSpace(15);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.setTextColor(15, 23, 42);
      doc.text("What this could mean for you", margin, y);
      y += 8;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      result.biggerPicture.forEach(line => { addBullet(line); y += 2; });
      y += 6;
    }

    ensureSpace(15);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text("Summary for your GP", margin, y);
    y += 8;
    doc.setFontSize(11);
    const gpFields = [
      { label: "Symptoms:", value: result.selectedSymptomLabels.join(", ") },
      { label: "Severity:", value: result.severity },
      { label: "Duration:", value: result.duration || "Not specified" },
      { label: "Risk Level:", value: result.riskLabel },
      { label: "Red Flag:", value: result.isRedFlag ? "Yes ⚠️" : "No" }
    ];
    gpFields.forEach(field => {
      const labelWidth = 35;
      const valMaxWidth = contentWidth - labelWidth;
      const lines = doc.splitTextToSize(field.value, valMaxWidth);
      ensureSpace(Math.max(6, lines.length * 6));
      doc.setFont("helvetica", "bold");
      doc.text(field.label, margin, y);
      doc.setFont("helvetica", "normal");
      doc.text(lines, margin + labelWidth, y);
      y += (lines.length * 6) + 2;
    });
    y += 8;

    ensureSpace(15);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text("Why Kashf suggests this", margin, y);
    y += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    result.why.forEach(line => { addBullet(line); y += 2; });
    if (scanResult && scanResult.observations.length > 0) {
      addBullet("Some facial wellness signals were noted that may be worth discussing with a clinician.");
      if (scanResult.insights && scanResult.insights.length > 0) {
        scanResult.insights.forEach(insight => addBullet(`BP Insight: ${insight}`));
      }
      y += 2;
    }
    y += 8;

    ensureSpace(15);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text("Questions for your GP", margin, y);
    y += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    result.gpQuestions.forEach(q => { addBullet(q); y += 2; });
    y += 8;

    if (scanResult && scanResult.observations.length > 0) {
      ensureSpace(15);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.text("Facial Wellness Observations", margin, y);
      y += 8;
      doc.setFontSize(11);
      scanResult.observations.forEach(obs => { addBullet(obs.label); y += 2; });
      
      if (scanResult.insights && scanResult.insights.length > 0) {
        y += 4;
        doc.setFont("helvetica", "bold");
        doc.text("BrowserPod Local Insights:", margin, y);
        y += 6;
        doc.setFont("helvetica", "normal");
        scanResult.insights.forEach(insight => { addBullet(insight); y += 2; });
      }

      y += 4;
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      const disclaimer = "Facial scan observations are based on visible wellness signals only.";
      addWrappedText(disclaimer, margin, contentWidth, 4);
      doc.setTextColor(15, 23, 42);
      y += 4;
    }

    if (healthData && healthData.metrics) {
      ensureSpace(35);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.text("Your Health Signals", margin, y);
      y += 8;
      doc.setFontSize(11);
      const m = healthData.metrics;
      const metrics = [
        { label: "Resting Heart Rate:", value: m.heartRate },
        { label: "Sleep Duration:", value: m.sleep },
        { label: "Activity Level:", value: m.activity },
        { label: "Recovery Score:", value: m.recovery },
        { label: "HRV:", value: m.hrv },
        { label: "Steps Today:", value: m.steps }
      ];
      metrics.forEach(item => {
        ensureSpace(6);
        doc.setFont("helvetica", "bold");
        doc.text(item.label, margin + 5, y);
        doc.setFont("helvetica", "normal");
        doc.text(item.value, margin + 55, y);
        y += 6;
      });
      y += 8;
    }

    ensureSpace(25);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(153, 27, 27);
    doc.text("Safety Guidance", margin, y);
    y += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const safetyText = "This is not a medical diagnosis. If your symptoms are severe, seek medical advice.";
    addWrappedText(safetyText, margin, contentWidth, 5);

    if (tailoredInsight) {
      ensureSpace(30);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.text("Tailored AI Insight", margin, y);
      y += 8;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      addWrappedText(tailoredInsight.clinicalNarrative, margin, contentWidth);
      y += 4;
      
      doc.setFont("helvetica", "bold");
      doc.text("Key Correlations:", margin, y);
      y += 6;
      doc.setFont("helvetica", "normal");
      tailoredInsight.systemCorrelations.forEach(c => { addBullet(c); y += 2; });
      y += 4;
    }

    doc.save("kashf-report.pdf");
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Your Assessment Report</h2>

      {/* AI Reasoning Section */}
      <div style={{ ...styles.card, background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)', border: '1px solid #BAE6FD' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ padding: '8px', backgroundColor: '#0EA5E9', borderRadius: '10px', color: 'white' }}>
            <span style={{ fontSize: '20px' }}>🤖</span>
          </div>
          <div>
            <h3 style={{ ...styles.cardTitle, color: '#0369A1', marginBottom: '2px' }}>AI Synthesis</h3>
            <p style={{ fontSize: '11px', color: '#0EA5E9', fontWeight: 600, textTransform: 'uppercase', margin: 0 }}>Tailored Perspective</p>
          </div>
        </div>

        {isLoadingAI ? (
          <div style={{ padding: '20px 0', textAlign: 'center' }}>
            <div style={{ display: 'inline-block', width: '20px', height: '20px', border: '3px solid #0EA5E9', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
            <p style={{ color: '#0369A1', fontSize: '14px', fontWeight: 500 }}>Reasoning across systems...</p>
            <style>{`
              @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
          </div>
        ) : tailoredInsight ? (
          <div className="animate-fade">
            <p style={{ fontSize: '15px', lineHeight: '1.6', color: '#0C4A6E', marginBottom: '20px', fontWeight: 500 }}>
              {tailoredInsight.clinicalNarrative}
            </p>
            
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
              <h4 style={{ fontSize: '12px', color: '#0369A1', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>System Correlations</h4>
              <ul style={styles.list}>
                {tailoredInsight.systemCorrelations.map((c, i) => (
                  <li key={i} style={{ ...styles.listItem, color: '#0369A1', fontSize: '13px' }}>
                    <span style={{ position: 'absolute', left: 0, color: '#0EA5E9' }}>→</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ borderTop: '1px solid #BAE6FD', paddingTop: '16px' }}>
              <p style={{ fontSize: '13px', color: '#0369A1', margin: 0 }}>
                <strong>Personalized Advice:</strong> {tailoredInsight.personalizedAdvice}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {/* 1. Risk Summary */}
      <div style={{...styles.card, borderTop: `4px solid ${styles.colors[result.riskLevel]}`}}>
        <div style={styles.cardHeader}>
          <h3 style={styles.cardTitle}>Risk Summary</h3>
          <span style={styles.badge(result.riskLevel)}>{result.riskLabel}</span>
        </div>
        <p style={styles.summaryText}>{result.riskSummary}</p>
      </div>

      {/* 1.5 Your Health Signals */}
      {healthData && healthData.metrics && (
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{...styles.cardTitle, margin: 0}}>Your Health Signals</h3>
            <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', backgroundColor: '#F1F5F9', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              via {healthData.brand}
            </span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '24px' }}>
            <HealthMetricCard 
              icon="❤️" 
              label="Heart Rate" 
              value={healthData.metrics.heartRate} 
              status={getHealthStatus('Heart Rate', healthData.metrics.heartRate)} 
            />
            <HealthMetricCard 
              icon="😴" 
              label="Sleep" 
              value={healthData.metrics.sleep} 
              status={getHealthStatus('Sleep', healthData.metrics.sleep)} 
            />
            <div style={{...styles.healthMetricCard, gridColumn: 'span 2'}}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '20px' }}>⚡</span>
                  <span style={styles.healthMetricLabel}>Recovery</span>
                </div>
                <span style={styles.healthMetricValue}>{healthData.metrics.recovery}</span>
              </div>
              <div style={{ height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  width: healthData.metrics.recovery, 
                  backgroundColor: getHealthStatus('Recovery', healthData.metrics.recovery)?.color || '#2F6FED',
                  transition: 'width 1s ease-out'
                }} />
              </div>
              {getHealthStatus('Recovery', healthData.metrics.recovery) && (
                <div style={{ fontSize: '11px', color: getHealthStatus('Recovery', healthData.metrics.recovery)?.color, fontWeight: 600, marginTop: '6px' }}>
                  {getHealthStatus('Recovery', healthData.metrics.recovery)?.text} readiness
                </div>
              )}
            </div>
            <HealthMetricCard icon="🏃" label="Activity" value={healthData.metrics.activity} badge={true} />
            <HealthMetricCard icon="📊" label="HRV" value={healthData.metrics.hrv} status={getHealthStatus('HRV', healthData.metrics.hrv)} sub="Heart Rate Variability" />
            <HealthMetricCard icon="👟" label="Steps" value={healthData.metrics.steps} status={getHealthStatus('Steps', healthData.metrics.steps)} />
          </div>

          {aiInsight && (
            <div style={{ padding: '16px', backgroundColor: '#F0F9FF', borderRadius: '12px', borderLeft: '4px solid #0EA5E9', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontSize: '18px' }}>💡</span>
              <p style={{ fontSize: '13px', color: '#0369A1', margin: 0, lineHeight: '1.5', fontWeight: 500 }}>{aiInsight}</p>
            </div>
          )}
        </div>
      )}

      {/* 2. Recommended Next Step */}
      <div style={{ ...styles.card, borderLeft: `4px solid ${styles.colors[result.riskLevel]}` }}>
        <h3 style={styles.cardTitle}>Recommended next step</h3>
        <p style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', marginBottom: '12px' }}>
          {tailoredInsight?.nextStep || result.recommendation}
        </p>
        <p style={{ fontSize: '14px', color: '#64748B' }}>{result.explanation}</p>
      </div>

      {/* 3. Care Impact Dashboard */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Care Impact Dashboard</h3>
        <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '20px' }}>
          Understanding the difference between immediate and delayed action:
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div style={{ backgroundColor: '#F0FDF4', padding: '16px', borderRadius: '12px', border: '1px solid #BBF7D0' }}>
            <h4 style={{ fontSize: '12px', color: '#166534', textTransform: 'uppercase', marginBottom: '8px' }}>If you act now</h4>
            <ul style={{ ...styles.list, padding: 0, margin: 0 }}>
              {(tailoredInsight?.careImpact.actNow || impactData.actNow).map((item, i) => (
                <li key={i} style={{ ...styles.listItem, fontSize: '13px', color: '#14532D', marginBottom: '4px' }}>✓ {item}</li>
              ))}
            </ul>
          </div>
          <div style={{ backgroundColor: '#FEF2F2', padding: '16px', borderRadius: '12px', border: '1px solid #FECACA' }}>
            <h4 style={{ fontSize: '12px', color: '#991B1B', textTransform: 'uppercase', marginBottom: '8px' }}>If delayed</h4>
            <ul style={{ ...styles.list, padding: 0, margin: 0 }}>
              {(tailoredInsight?.careImpact.delayed || impactData.delayed).map((item, i) => (
                <li key={i} style={{ ...styles.listItem, fontSize: '13px', color: '#7F1D1D', marginBottom: '4px' }}>! {item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #E2E8F0' }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#0F172A' }}>Estimated impact levels</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <ImpactMetric icon="clock" label="Time" value={impactData.impact.time} />
            <ImpactMetric icon="pulse" label="Care" value={impactData.impact.complexity} />
            <ImpactMetric icon="alert" label="Risk" value={impactData.impact.escalation} />
          </div>
        </div>
      </div>

      {/* 4. Why Kashf suggests this */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Why Kashf suggests this</h3>
        <ul style={styles.list}>
          {(tailoredInsight?.whySuggested || result.why).map((item, index) => (
            <li key={index} style={styles.listItem}>{item}</li>
          ))}
          {scanResult && scanResult.observations.length > 0 && (
            <li style={styles.listItem}>Facial wellness signals detected during scan correlate with your wellness profile.</li>
          )}
        </ul>
      </div>

      {/* 5. What this could mean for you */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>What this could mean for you</h3>
        <ul style={styles.list}>
          {(tailoredInsight?.biggerPicture || result.biggerPicture).map((item, index) => (
            <li key={index} style={styles.listItem}>{item}</li>
          ))}
        </ul>
      </div>

      {/* 6. Summary for your GP */}
      <div style={{...styles.card, background: '#F8FAFC'}}>
        <h3 style={styles.cardTitle}>Summary for your GP</h3>
        <div style={styles.gpSummaryGrid}>
          <GPItem label="Symptoms" value={result.selectedSymptomLabels.join(", ")} />
          <GPItem label="Severity" value={result.severity} />
          <GPItem label="Duration" value={result.duration || 'Not specified'} />
          <GPItem label="Risk Level" value={result.riskLabel} />
          <GPItem label="Red Flag" value={result.isRedFlag ? 'Yes ⚠️' : 'No'} isAlert={result.isRedFlag} />
        </div>
      </div>

      {/* 7. Questions to ask your GP */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Questions to ask your GP</h3>
        <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px' }}>
          Specific questions suggested by Kashf based on your unique profile:
        </p>
        <ul style={styles.list}>
          {(tailoredInsight?.dynamicGPQuestions || result.gpQuestions).map((item, index) => (
            <li key={index} style={styles.listItem}>{item}</li>
          ))}
        </ul>
      </div>

      {/* 8. Facial Wellness Observations */}
      {scanResult && scanResult.observations.length > 0 && (
        <div style={{...styles.card, borderLeft: '4px solid #60A5FA'}}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={styles.cardTitle}>Facial wellness observations</h3>
            <span style={{fontSize: '12px', color: '#64748B', fontWeight: 600}}>Scan quality: {scanResult.scanQuality}</span>
          </div>
          <p style={{fontSize: '14px', color: '#475569', marginBottom: '16px'}}>Kashf noticed the following visible wellness signals:</p>
          <ul style={styles.list}>
            {scanResult.observations.map((obs, i) => <li key={i} style={styles.listItem}>{obs.label}</li>)}
          </ul>
          
          {scanResult.insights && scanResult.insights.length > 0 && (
            <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#F0F9FF', borderRadius: '8px', borderLeft: '4px solid #0EA5E9' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#0369A1', textTransform: 'uppercase', letterSpacing: '0.025em' }}>BrowserPod Insights</h4>
              <ul style={{ ...styles.list, marginBottom: 0 }}>
                {scanResult.insights.map((insight, i) => (
                  <li key={i} style={{ ...styles.listItem, color: '#0C4A6E', fontSize: '13px', marginBottom: '4px' }}>{insight}</li>
                ))}
              </ul>
            </div>
          )}

          <p style={{fontSize: '13px', color: '#64748B', marginTop: '16px', fontStyle: 'italic'}}>These are visible wellness signals only and not a medical diagnosis.</p>
        </div>
      )}

      {/* 9. Safety Guidance */}
      <div style={styles.safetyCard}>
        <h3 style={{...styles.cardTitle, color: '#991B1B', marginBottom: '8px'}}>Safety Guidance</h3>
        <p style={{fontSize: '14px', color: '#991B1B'}}>If symptoms are severe, seek medical advice immediately. Call 999 in an emergency.</p>
      </div>

      {/* 10. Actions */}
      <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
        <div style={styles.actionGroup}>
          <button style={styles.secondaryButton} onClick={downloadPDF}>Download PDF Report ↓</button>
          <button style={styles.button} onClick={onStartAgain}>Start another check</button>
        </div>
        {onRescanFace && (
          <button style={styles.rescanButton} onClick={onRescanFace}>Rescan Face</button>
        )}
      </div>
    </div>
  );
}

function ImpactMetric({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#F8FAFC', borderRadius: '8px' }}>
      <div style={{ fontSize: '14px', color: '#64748B' }}>{icon === 'clock' ? '🕒' : icon === 'pulse' ? '📈' : '⚠️'}</div>
      <div>
        <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.025em' }}>{label}</div>
        <div style={{ fontSize: '14px', color: '#0F172A', fontWeight: 600 }}>{value}</div>
      </div>
    </div>
  );
}

function GPItem({ label, value, isAlert }: { label: string; value: string; isAlert?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', padding: '4px 0' }}>
      <span style={{ fontSize: '14px', color: '#64748B', fontWeight: 600 }}>{label}:</span>
      <span style={{ fontSize: '14px', fontWeight: '500', color: isAlert ? '#EF4444' : '#0F172A', textAlign: 'right', maxWidth: '60%' }}>{value}</span>
    </div>
  );
}

function HealthMetricCard({ icon, label, value, status, badge, sub }: { icon: string; label: string; value: string; status?: any; badge?: boolean; sub?: string }) {
  return (
    <div style={styles.healthMetricCard}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <span style={{ fontSize: '18px' }}>{icon}</span>
        <span style={styles.healthMetricLabel}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
        <span style={styles.healthMetricValue}>{value}</span>
        {badge && <span style={styles.miniBadge}>{value}</span>}
      </div>
      {sub && <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '2px' }}>{sub}</div>}
      {status && (
        <div style={{ fontSize: '11px', color: status.color, fontWeight: 600, marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: status.color }} />
          {status.text}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '24px',
    width: '100%',
    maxWidth: '800px',
    margin: '0 auto',
  },
  title: {
    fontSize: "24px",
    fontWeight: "800",
    color: '#0F172A',
    textAlign: "center" as const,
    marginBottom: "8px",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: "16px",
    padding: "24px",
    border: "1px solid #E2E8F0",
    boxShadow: "0 4px 12px rgba(15, 23, 42, 0.03)",
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#0F172A',
    margin: 0,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  badge: (level: string) => ({
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '700',
    textTransform: 'uppercase' as const,
    backgroundColor: level === 'urgent' ? '#FEE2E2' : level === 'moderate' ? '#FEF3C7' : '#DCFCE7',
    color: level === 'urgent' ? '#B91C1C' : level === 'moderate' ? '#92400E' : '#15803D',
  }),
  summaryText: { fontSize: '16px', lineHeight: '1.6', color: '#334155', margin: 0 },
  nextStepBox: { marginTop: '12px', padding: '16px', background: '#F1F5F9', borderRadius: '12px', borderLeft: '4px solid #2F6FED' },
  nextStepText: { fontSize: '16px', fontWeight: '600', color: '#0F172A', margin: 0 },
  list: { listStyle: "none", padding: 0, margin: 0 },
  listItem: { position: "relative" as const, paddingLeft: "20px", marginBottom: "8px", fontSize: "14px", color: "#475569" },
  comparisonGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #E2E8F0' },
  comparisonColumn: { display: 'flex', flexDirection: 'column' as const },
  comparisonTitle: { fontSize: '12px', fontWeight: '800', padding: '4px 10px', borderRadius: '6px', alignSelf: 'flex-start', marginBottom: '8px', textTransform: 'uppercase' as const },
  healthMetricCard: { padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #F1F5F9' },
  healthMetricLabel: { fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em' },
  healthMetricValue: { fontSize: '18px', fontWeight: '800', color: '#0F172A' },
  miniBadge: { fontSize: '10px', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#E0F2FE', color: '#0369A1', fontWeight: 700, textTransform: 'uppercase' as const },
  gpSummaryGrid: { display: 'flex', flexDirection: 'column' as const, gap: '4px' },
  safetyCard: { backgroundColor: "#FEF2F2", borderRadius: "16px", padding: "24px", border: "1.5px solid #FECACA" },
  button: { padding: "16px 32px", borderRadius: "12px", border: "none", backgroundColor: "#0F172A", color: "#FFFFFF", fontSize: "16px", fontWeight: "700", cursor: "pointer", boxShadow: "0 10px 20px rgba(15, 23, 42, 0.2)", transition: 'all 0.2s' },
  secondaryButton: { padding: "12px 24px", borderRadius: "12px", border: "1.5px solid #0F172A", backgroundColor: "transparent", color: "#0F172A", fontSize: "15px", fontWeight: "600", cursor: "pointer", transition: 'all 0.2s', width: '100%', maxWidth: '320px' },
  actionGroup: { display: 'flex', flexDirection: 'column' as const, gap: '12px', alignItems: 'center', marginTop: '20px' },
  rescanButton: { 
    background: 'transparent', 
    border: '2px solid #60A5FA', 
    color: '#1E40AF', 
    padding: '12px 24px', 
    marginTop: '12px', 
    borderRadius: '12px', 
    cursor: 'pointer', 
    alignSelf: 'center',
    fontWeight: '700',
    fontSize: '14px',
    transition: 'all 0.2s ease'
  },
  colors: { low: '#22C55E', moderate: '#F59E0B', urgent: '#EF4444' }
};