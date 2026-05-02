import { jsPDF } from "jspdf";
import logo from "../assets/logo.png";
import type { AnalysisResult } from "../utils/riskEngine";

type Props = {
  result: AnalysisResult;
  onStartAgain: () => void;
};

export default function ResultsDashboard({ result, onStartAgain }: Props) {
  const downloadPDF = () => {
    const doc = new jsPDF();
    let y = 35;

    // Header & Logo
    doc.addImage(logo, "PNG", 150, 10, 40, 15);
    doc.setDrawColor(200);
    doc.line(10, 25, 200, 25);

    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42); // Navy
    doc.text("Kashf Care Summary", 10, y);
    y += 10;

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // Muted
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 10, y);
    y += 15;

    // Risk Summary
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text("Risk Summary", 10, y);
    y += 8;
    doc.setFontSize(12);
    doc.setTextColor(result.isRedFlag ? 239 : 47, result.isRedFlag ? 68 : 111, result.isRedFlag ? 68 : 237);
    doc.text(result.riskLabel, 10, y);
    y += 8;
    doc.setFontSize(11);
    doc.setTextColor(51, 65, 85);
    const summaryLines = doc.splitTextToSize(result.riskSummary, 180);
    doc.text(summaryLines, 10, y);
    y += (summaryLines.length * 6) + 10;

    // Recommendation
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text("Recommendation", 10, y);
    y += 8;
    doc.setFontSize(11);
    const recLines = doc.splitTextToSize(result.recommendation, 180);
    doc.text(recLines, 10, y);
    y += (recLines.length * 6) + 12;

    // GP Summary Table-like
    doc.setFontSize(14);
    doc.text("Signals Summary for GP", 10, y);
    y += 8;
    doc.setFontSize(10);
    doc.text(`Symptoms:`, 10, y);
    const sympLines = doc.splitTextToSize(result.selectedSymptomLabels.join(", "), 140);
    doc.text(sympLines, 40, y);
    y += (sympLines.length * 5) + 2;
    doc.text(`Severity:`, 10, y);
    doc.text(result.severity, 40, y);
    y += 6;
    doc.text(`Duration:`, 10, y);
    doc.text(result.duration || "Not specified", 40, y);
    y += 15;

    // Why
    doc.setFontSize(12);
    doc.text("Why this recommendation?", 10, y);
    y += 8;
    doc.setFontSize(10);
    result.why.forEach(line => {
      const wrappedLine = doc.splitTextToSize(`- ${line}`, 180);
      doc.text(wrappedLine, 10, y);
      y += (wrappedLine.length * 5);
    });
    y += 10;

    // Questions
    doc.setFontSize(12);
    doc.text("Questions to ask your GP", 10, y);
    y += 8;
    doc.setFontSize(10);
    result.gpQuestions.forEach(q => {
      const wrappedQ = doc.splitTextToSize(`- ${q}`, 180);
      doc.text(wrappedQ, 10, y);
      y += (wrappedQ.length * 5);
    });
    y += 20;

    // Footer Disclaimer
    doc.setFontSize(9);
    doc.setTextColor(153, 27, 27); // Dark red
    doc.text("DISCLAIMER: This is not a medical diagnosis.", 10, y);
    y += 5;
    doc.setTextColor(100, 116, 139);
    doc.text("If symptoms are severe or worsening, seek professional medical advice immediately.", 10, y);

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
    maxWidth: '320px',
  },
};