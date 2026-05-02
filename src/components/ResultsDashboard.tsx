import { jsPDF } from "jspdf";
import logo from "../assets/logo.png";
import type { AnalysisResult } from "../utils/riskEngine";

import type { FaceScanResult } from "./FaceScan";

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

    // Helper: Add page if needed
    const ensureSpace = (requiredHeight: number) => {
      if (y + requiredHeight > pageHeight - bottomMargin) {
        doc.addPage();
        y = 20; // reset to top margin
        
        // Add continuation header
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(15, 23, 42);
        doc.text("Kashf Care Summary (cont.)", margin, y);
        doc.addImage(logo, "PNG", pageWidth - 35, y - 5, 20, 7.5);
        y += 15;
      }
    };

    // Helper: Add wrapped text and update y
    const addWrappedText = (text: string, x: number, maxWidth: number, lineHeight: number = 6) => {
      const lines = doc.splitTextToSize(text, maxWidth);
      ensureSpace(lines.length * lineHeight);
      doc.text(lines, x, y);
      y += lines.length * lineHeight;
    };

    // Helper: Add bullet point with hanging indent and update y
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

    // 1. Header & Logo
    doc.addImage(logo, "PNG", pageWidth - 55, 10, 40, 15);
    doc.setDrawColor(226, 232, 240); // Soft border color
    doc.line(margin, 28, pageWidth - margin, 28);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(15, 23, 42); // Navy
    doc.text("Kashf Care Summary", margin, y);
    y += 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // Muted
    doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, margin, y);
    y += 15;

    // 2. Risk Overview
    ensureSpace(20);
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

    // 3. Recommended Next Step
    ensureSpace(15);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(15, 23, 42);
    doc.text("Recommended Next Step", margin, y);
    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    addWrappedText(result.recommendation, margin, contentWidth);
    y += 8;

    // 3.5 Care Impact Overview
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
    y += 6;

    // 3.6 What this could mean for you (Explanation)
    if (result.biggerPicture && result.biggerPicture.length > 0) {
      ensureSpace(15);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.setTextColor(15, 23, 42);
      doc.text("What this could mean for you", margin, y);
      y += 8;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      result.biggerPicture.forEach(line => {
        addBullet(line);
        y += 2;
      });
      y += 6;
    }

    // 4. Summary for your GP
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

    // 5. Why Kashf suggests this
    ensureSpace(15);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text("Why Kashf suggests this", margin, y);
    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    result.why.forEach(line => {
      addBullet(line);
      y += 2;
    });
    if (scanResult && scanResult.observations.length > 0) {
      addBullet("Some facial wellness signals were noted that may be worth discussing with a clinician.");
      y += 2;
    }
    y += 8;

    // 6. Questions for your GP
    ensureSpace(15);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text("Questions for your GP", margin, y);
    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    result.gpQuestions.forEach(q => {
      addBullet(q);
      y += 2;
    });
    y += 8;

    // 6.5 Facial Wellness Observations
    if (scanResult && scanResult.observations.length > 0) {
      ensureSpace(15);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.text("Facial Wellness Observations", margin, y);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Quality: ${scanResult.scanQuality}`, pageWidth - margin - 25, y);
      doc.setTextColor(15, 23, 42); // Reset to navy
      y += 8;

      doc.setFontSize(11);
      scanResult.observations.forEach(obs => {
        addBullet(obs.label);
        y += 2;
      });
      y += 4;
      
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      const disclaimer = "Facial scan observations are based on visible wellness signals only. They are included to help you describe changes, not to diagnose a condition.";
      addWrappedText(disclaimer, margin, contentWidth, 4);
      doc.setTextColor(15, 23, 42); // Reset to navy
      doc.setFont("helvetica", "normal");
      y += 4;
    }
    
    // 6.7 Connected Health Data
    if (healthData && healthData.metrics) {
      ensureSpace(35);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.text("Connected Health Data", margin, y);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      const brandName = healthData.brand.charAt(0).toUpperCase() + healthData.brand.slice(1);
      doc.text(`Source: ${brandName} (Demo Profile)`, pageWidth - margin - 55, y);
      doc.setTextColor(15, 23, 42);
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

    // 7. Safety Guidance
    ensureSpace(25);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(153, 27, 27); // Dark red
    doc.text("Safety Guidance", margin, y);
    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const safetyText = "This is not a medical diagnosis. If your symptoms are severe, sudden, worsening, or you are worried, seek medical advice. If you experience chest pain, difficulty breathing, or signs of stroke, call 999 or go to A&E.";
    addWrappedText(safetyText, margin, contentWidth, 5);

    doc.save("kashf-report.pdf");
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Your Assessment Report</h2>

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
              value={`${healthData.metrics.heartRate}`} 
              status={getHealthStatus('Heart Rate', healthData.metrics.heartRate)} 
            />
            <HealthMetricCard 
              icon="😴" 
              label="Sleep" 
              value={`${healthData.metrics.sleep}`} 
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
            <HealthMetricCard 
              icon="🏃" 
              label="Activity" 
              value={healthData.metrics.activity} 
              badge={true}
            />
            <HealthMetricCard 
              icon="📊" 
              label="HRV" 
              value={healthData.metrics.hrv} 
              status={getHealthStatus('HRV', healthData.metrics.hrv)}
              sub="Heart Rate Variability"
            />
            <HealthMetricCard 
              icon="👟" 
              label="Steps" 
              value={healthData.metrics.steps} 
              status={getHealthStatus('Steps', healthData.metrics.steps)}
            />
          </div>

          {aiInsight && (
            <div style={{ padding: '16px', backgroundColor: '#F0F9FF', borderRadius: '12px', borderLeft: '4px solid #0EA5E9', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontSize: '18px' }}>💡</span>
              <p style={{ fontSize: '13px', color: '#0369A1', margin: 0, lineHeight: '1.5', fontWeight: 500 }}>
                {aiInsight}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 2. Recommended Next Step */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Recommended Next Step</h3>
        <div style={styles.nextStepBox}>
           <p style={styles.nextStepText}>{result.recommendation}</p>
        </div>
      </div>

      {/* 3. Care Impact Overview */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Care Impact Overview</h3>
        <p style={{fontSize: '14px', color: '#64748B', marginBottom: '20px', marginTop: '4px'}}>
          Understanding the real-world impact of your care timeline.
        </p>
        
        <div style={styles.comparisonGrid}>
          <div style={styles.comparisonColumn}>
            <span style={{...styles.comparisonTitle, color: '#15803D', background: '#DCFCE7'}}>If you act now</span>
            <ul style={styles.list}>
              {impactData.actNow.map((item, i) => (
                <li key={i} style={{...styles.listItem, fontSize: '13px'}}>{item}</li>
              ))}
            </ul>
          </div>
          <div style={styles.comparisonColumn}>
            <span style={{...styles.comparisonTitle, color: '#B91C1C', background: '#FEE2E2'}}>If delayed</span>
            <ul style={styles.list}>
              {impactData.delayed.map((item, i) => (
                <li key={i} style={{...styles.listItem, fontSize: '13px'}}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #E2E8F0' }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#0F172A' }}>Estimated impact</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#F8FAFC', borderRadius: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              <div>
                <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.025em' }}>Time</div>
                <div style={{ fontSize: '14px', color: '#0F172A', fontWeight: 600 }}>{impactData.impact.time}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#F8FAFC', borderRadius: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              <div>
                <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.025em' }}>Care</div>
                <div style={{ fontSize: '14px', color: '#0F172A', fontWeight: 600 }}>{impactData.impact.complexity}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#F8FAFC', borderRadius: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <div>
                <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.025em' }}>Risk</div>
                <div style={{ fontSize: '14px', color: '#0F172A', fontWeight: 600 }}>{impactData.impact.escalation}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Why Kashf suggests this */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Why Kashf suggests this</h3>
        <ul style={styles.list}>
          {result.why.map((item, index) => (
            <li key={index} style={styles.listItem}>{item}</li>
          ))}
          {scanResult && scanResult.observations.length > 0 && (
            <li style={styles.listItem}>
              Some facial wellness signals were noted that may be worth discussing with a clinician.
            </li>
          )}
        </ul>
      </div>

      {/* 4. What this could mean for you */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>What this could mean for you</h3>
        <ul style={styles.list}>
          {result.biggerPicture.map((item, index) => (
            <li key={index} style={styles.listItem}>{item}</li>
          ))}
        </ul>
      </div>

      {/* 5. Summary for your GP */}
      <div style={{...styles.card, background: '#F8FAFC'}}>
        <h3 style={styles.cardTitle}>Summary for your GP</h3>
        <div style={styles.gpSummaryGrid}>
          <div style={styles.gpItem}>
            <span style={styles.gpLabel}>Symptoms:</span>
            <span style={styles.gpValue}>{result.selectedSymptomLabels.join(", ")}</span>
          </div>
          <div style={styles.gpItem}>
            <span style={styles.gpLabel}>Severity:</span>
            <span style={styles.gpValue}>{result.severity}</span>
          </div>
          <div style={styles.gpItem}>
            <span style={styles.gpLabel}>Duration:</span>
            <span style={styles.gpValue}>{result.duration || 'Not specified'}</span>
          </div>
          <div style={styles.gpItem}>
            <span style={styles.gpLabel}>Risk Level:</span>
            <span style={styles.gpValue}>{result.riskLabel}</span>
          </div>
          <div style={styles.gpItem}>
            <span style={styles.gpLabel}>Red Flag Detected:</span>
            <span style={{...styles.gpValue, color: result.isRedFlag ? '#EF4444' : '#22C55E', fontWeight: 'bold'}}>
              {result.isRedFlag ? 'Yes ⚠️' : 'No'}
            </span>
          </div>
        </div>
      </div>

      {/* 6. Questions to ask your GP */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Questions to ask your GP</h3>
        <ul style={styles.list}>
          {result.gpQuestions.map((item, index) => (
            <li key={index} style={styles.listItem}>{item}</li>
          ))}
        </ul>
      </div>

      {/* 6.5 Facial Wellness Observations */}
      {scanResult && scanResult.observations.length > 0 && (
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <h3 style={{...styles.cardTitle, color: '#2F6FED', margin: 0}}>Facial wellness observations</h3>
            <span style={{ fontSize: '12px', fontWeight: 600, padding: '4px 8px', borderRadius: '4px', backgroundColor: '#F1F5F9', color: '#475569' }}>
              Quality: {scanResult.scanQuality}
            </span>
          </div>
          <p style={{fontSize: '14px', color: '#334155', marginBottom: '12px', marginTop: 0}}>
            Kashf noticed the following visible wellness signals:
          </p>
          <ul style={{...styles.list, marginTop: 0}}>
            {scanResult.observations.map((obs, index) => (
              <li key={index} style={{...styles.listItem, color: '#0F172A', fontWeight: 500}}>{obs.label}</li>
            ))}
          </ul>
          <p style={{fontSize: '14px', color: '#334155', marginTop: '12px', marginBottom: 0}}>
            These may help you describe your symptoms more clearly when speaking to a GP.
          </p>
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #E2E8F0' }}>
            <p style={{fontSize: '13px', color: '#64748B', margin: 0}}>
              Facial scan observations are based on visible wellness signals only. They are included to help you describe changes, not to diagnose a condition.
            </p>
          </div>
        </div>
      )}



      {/* 7. Safety Guidance */}
      <div style={styles.safetyCard}>
        <h3 style={{...styles.cardTitle, color: '#991B1B', marginBottom: '8px'}}>Safety Guidance</h3>
        <p style={{fontSize: '14px', color: '#991B1B', marginBottom: '8px'}}>
          <strong>This is not a medical diagnosis.</strong>
        </p>
        <p style={{fontSize: '14px', color: '#991B1B'}}>
          If symptoms are severe, sudden, worsening, or you are worried, seek medical advice immediately.
        </p>
      </div>

      {/* 8. Actions */}
      <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
        <div style={styles.actionGroup}>
          <button style={styles.secondaryButton} onClick={downloadPDF}>
            Download PDF Report ↓
          </button>
          <button style={styles.button} onClick={onStartAgain}>
            Start another check
          </button>
        </div>
        {onRescanFace && (
          <button 
            style={{
              ...styles.secondaryButton, 
              alignSelf: 'center', 
              background: 'transparent', 
              border: '1px solid #CBD5E1', 
              color: '#475569',
              padding: '10px 24px',
              marginTop: '4px'
            }} 
            onClick={onRescanFace}
          >
            Rescan Face
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  colors: {
    navy: '#0F172A',
    blue: '#2F6FED',
    softBlue: '#60A5FA',
    bg: '#F5F7FB',
    card: '#FFFFFF',
    muted: '#64748B',
    urgent: '#EF4444',
    moderate: '#F59E0B',
    low: '#22C55E',
  },
  container: {
    width: "100%",
    maxWidth: "800px",
    margin: "0 auto",
    padding: "20px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "24px",
    animation: 'fadeIn 0.5s ease-out',
  },
  title: {
    fontSize: "28px",
    fontWeight: "800",
    color: '#0F172A',
    textAlign: "center" as const,
    marginBottom: "8px",
    letterSpacing: '-0.5px',
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
  summaryText: {
    fontSize: '16px',
    lineHeight: '1.6',
    color: '#334155',
    margin: 0,
  },
  nextStepBox: {
    marginTop: '12px',
    padding: '16px',
    background: '#F1F5F9',
    borderRadius: '12px',
    borderLeft: '4px solid #2F6FED',
  },
  nextStepText: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#0F172A',
    margin: 0,
  },
  list: {
    marginTop: '12px',
    paddingLeft: '20px',
    margin: 0,
  },
  listItem: {
    fontSize: '15px',
    lineHeight: '1.6',
    color: '#475569',
    marginBottom: '8px',
  },
  gpSummaryGrid: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
    marginTop: '16px',
  },
  gpItem: {
    display: 'flex',
    justifyContent: 'space-between',
    borderBottom: '1px solid #E2E8F0',
    paddingBottom: '8px',
  },
  gpLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#64748B',
  },
  gpValue: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#0F172A',
    textAlign: 'right' as const,
    maxWidth: '60%',
  },
  safetyCard: {
    backgroundColor: "#FEF2F2",
    borderRadius: "16px",
    padding: "24px",
    border: "1.5px solid #FECACA",
  },
  button: {
    alignSelf: "center" as const,
    padding: "16px 32px",
    borderRadius: "12px",
    border: "none",
    backgroundColor: "#0F172A",
    color: "#FFFFFF",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 10px 20px rgba(15, 23, 42, 0.2)",
    transition: 'all 0.2s',
  },
  actionGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
    alignItems: 'center',
    marginTop: '20px',
  },
  secondaryButton: {
    padding: "12px 24px",
    borderRadius: "12px",
    border: "1.5px solid #0F172A",
    backgroundColor: "transparent",
    color: "#0F172A",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    transition: 'all 0.2s',
    width: '100%',
    width: '100%',
    maxWidth: '320px',
  },
  metricRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px',
    gap: '12px',
  },
  metricLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#0F172A',
    width: '100px',
  },
  metricBarContainer: {
    display: 'flex',
    gap: '4px',
    flex: 1,
  },
  metricBar: {
    height: '6px',
    flex: 1,
    borderRadius: '3px',
  },
  metricValue: {
    fontSize: '12px',
    fontWeight: '700',
    width: '60px',
    textAlign: 'right' as const,
  },
  metricsContainer: {
    marginBottom: '24px',
  },
  comparisonGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '1px solid #E2E8F0',
  },
  comparisonColumn: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  comparisonTitle: {
    fontSize: '12px',
    fontWeight: '800',
    padding: '4px 10px',
    borderRadius: '6px',
    alignSelf: 'flex-start',
    marginBottom: '8px',
    textTransform: 'uppercase' as const,
  },
};