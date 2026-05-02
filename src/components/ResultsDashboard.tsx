import { jsPDF } from "jspdf";
import logo from "../assets/logo.png";
import type { AnalysisResult } from "../utils/riskEngine";

type Props = {
  result: AnalysisResult;
  onStartAgain: () => void;
};

const ImpactMetric = ({ label, level }: { label: string; level: 'Low' | 'Moderate' | 'High' }) => {
  const bars = { Low: 1, Moderate: 2, High: 3 };
  const colors = { Low: '#22C55E', Moderate: '#F59E0B', High: '#EF4444' };
  
  return (
    <div style={styles.metricRow}>
      <span style={styles.metricLabel}>{label}</span>
      <div style={styles.metricBarContainer}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{
            ...styles.metricBar,
            backgroundColor: i <= bars[level] ? colors[level] : '#E2E8F0'
          }} />
        ))}
      </div>
      <span style={{...styles.metricValue, color: colors[level]}}>{level}</span>
    </div>
  );
};

export default function ResultsDashboard({ result, onStartAgain }: Props) {
  const impactLevel = result.riskLevel === 'urgent' ? 'High' : result.riskLevel === 'moderate' ? 'Moderate' : 'Low';

  const downloadPDF = () => {
    const doc = new jsPDF();
    const margin = 15;
    const pageWidth = 210;
    const contentWidth = pageWidth - (margin * 2);
    let y = 35;

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
    y += 20;

    // 2. Risk Overview
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(15, 23, 42);
    doc.text("Risk Overview", margin, y);
    y += 10;

    doc.setFontSize(12);
    const riskColor = result.riskLevel === 'urgent' ? [239, 68, 68] : result.riskLevel === 'moderate' ? [245, 158, 11] : [34, 197, 94];
    doc.setTextColor(riskColor[0], riskColor[1], riskColor[2]);
    doc.text(`• ${result.riskLabel}`, margin, y);
    y += 7;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(51, 65, 85);
    const riskSummaryLines = doc.splitTextToSize(result.riskSummary, contentWidth);
    doc.text(riskSummaryLines, margin, y);
    y += (riskSummaryLines.length * 6) + 12;

    // 3. Recommended Next Step
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(15, 23, 42);
    doc.text("Recommended Next Step", margin, y);
    y += 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const recLines = doc.splitTextToSize(result.recommendation, contentWidth);
    doc.text(recLines, margin, y);
    y += (recLines.length * 6) + 15;

    // 4. Summary for your GP
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text("Summary for your GP", margin, y);
    y += 10;

    doc.setFontSize(11);
    const gpFields = [
      { label: "Symptoms:", value: result.selectedSymptomLabels.join(", ") },
      { label: "Severity:", value: result.severity },
      { label: "Duration:", value: result.duration || "Not specified" },
      { label: "Risk Level:", value: result.riskLabel },
      { label: "Red Flag:", value: result.isRedFlag ? "Yes ⚠️" : "No" }
    ];

    gpFields.forEach(field => {
      doc.setFont("helvetica", "bold");
      doc.text(field.label, margin, y);
      doc.setFont("helvetica", "normal");
      const valLines = doc.splitTextToSize(field.value, contentWidth - 40);
      doc.text(valLines, margin + 40, y);
      y += (valLines.length * 6);
    });
    y += 12;

    // 5. Why Kashf suggests this
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text("Why Kashf suggests this", margin, y);
    y += 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    result.why.forEach(line => {
      const wrappedLine = doc.splitTextToSize(`• ${line}`, contentWidth);
      doc.text(wrappedLine, margin, y);
      y += (wrappedLine.length * 6);
    });
    y += 12;

    // 6. Questions for your GP
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text("Questions for your GP", margin, y);
    y += 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    result.gpQuestions.forEach(q => {
      const wrappedQ = doc.splitTextToSize(`• ${q}`, contentWidth);
      doc.text(wrappedQ, margin, y);
      y += (wrappedQ.length * 6);
    });
    y += 20;

    // 7. Safety Guidance
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(153, 27, 27); // Dark red
    doc.text("Safety Guidance", margin, y);
    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const safetyText = "This is not a medical diagnosis. If your symptoms are severe, sudden, worsening, or you are worried, seek medical advice. If you experience chest pain, difficulty breathing, or signs of stroke, call 999 or go to A&E.";
    const safetyLines = doc.splitTextToSize(safetyText, contentWidth);
    doc.text(safetyLines, margin, y);

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
        
        <div style={styles.metricsContainer}>
          <ImpactMetric label="Time Impact" level={impactLevel} />
          <ImpactMetric label="Disruption" level={impactLevel} />
          <ImpactMetric label="Urgency Risk" level={impactLevel} />
        </div>

        <div style={styles.comparisonGrid}>
          <div style={styles.comparisonColumn}>
            <span style={{...styles.comparisonTitle, color: '#15803D', background: '#DCFCE7'}}>If you act now</span>
            <ul style={styles.list}>
              <li style={{...styles.listItem, fontSize: '13px'}}>Routine GP visit likely</li>
              <li style={{...styles.listItem, fontSize: '13px'}}>Lower life disruption</li>
            </ul>
          </div>
          <div style={styles.comparisonColumn}>
            <span style={{...styles.comparisonTitle, color: '#B91C1C', background: '#FEE2E2'}}>If delayed</span>
            <ul style={styles.list}>
              <li style={{...styles.listItem, fontSize: '13px'}}>Possible urgent care</li>
              <li style={{...styles.listItem, fontSize: '13px'}}>Higher stress & waiting</li>
            </ul>
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
      <div style={styles.actionGroup}>
        <button style={styles.secondaryButton} onClick={downloadPDF}>
          Download PDF Report ↓
        </button>
        <button style={styles.button} onClick={onStartAgain}>
          Start another check
        </button>
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