import { useEffect, useState } from "react";
import CubeLoader from "./ui/cube-loader";
import { MorphingTextReveal } from "./ui/morphing-text-reveal";

const terminalLines = [
  "booting Kashf reasoning kernel...",
  "opening encrypted local assessment context...",
  "fetching symptom signals from patient input...",
  "linking connected health data stream...",
  "reading facial wellness scan observations...",
  "checking NHS-style safety guidance...",
  "screening for red-flag escalation language...",
  "building GP-ready summary...",
  "preparing personalised care impact dashboard...",
  "finalising report interface...",
];

export default function ResultsLoadingTerminal() {
  const [visibleLines, setVisibleLines] = useState<string[]>([]);

  useEffect(() => {
    const timers = terminalLines.map((line, index) =>
      window.setTimeout(() => {
        setVisibleLines((current) => [...current, line]);
      }, 260 + index * 390)
    );

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  return (
    <section className="results-loading" aria-label="Preparing assessment results">
      <div className="results-loading__header">
        <p>Assessment pipeline</p>
        <MorphingTextReveal
          texts={["FETCHING", "ANALYSING", "SYNTHESISING", "READYING"]}
          interval={1300}
          className="results-loading__status"
        />
      </div>

      <CubeLoader />

      <div className="terminal-window">
        <div className="terminal-window__chrome">
          <span />
          <span />
          <span />
          <strong>kashf-results.sh</strong>
        </div>
        <div className="terminal-window__body">
          {visibleLines.map((line, index) => (
            <p key={`${line}-${index}`}>
              <span>$</span> {line}
            </p>
          ))}
          <p className="terminal-window__cursor"><span>$</span> awaiting renderer<span className="terminal-caret" /></p>
        </div>
      </div>
    </section>
  );
}
