import { useCallback, useEffect, useState } from "react";
import { cn } from "../../lib/utils";

interface MorphingTextRevealProps {
  texts: string[];
  className?: string;
  interval?: number;
  glitchOnHover?: boolean;
}

export function MorphingTextReveal({
  texts,
  className,
  interval = 3000,
  glitchOnHover = true,
}: MorphingTextRevealProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState(texts[0] ?? "");
  const [isAnimating, setIsAnimating] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const getRandomChar = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    return chars[Math.floor(Math.random() * chars.length)];
  };

  const morphToNext = useCallback(() => {
    if (isAnimating || texts.length === 0) return;

    setIsAnimating(true);
    const currentText = texts[currentIndex] || "";
    const nextIndex = (currentIndex + 1) % texts.length;
    const nextText = texts[nextIndex] || "";
    const maxLength = Math.max(currentText.length, nextText.length);

    let step = 0;
    const animateStep = () => {
      if (step <= maxLength) {
        let newText = "";

        for (let i = 0; i < maxLength; i += 1) {
          if (i < step) {
            newText += nextText[i] || "";
          } else if (i < currentText.length) {
            newText += Math.random() > 0.7 ? getRandomChar() : currentText[i];
          }
        }

        setDisplayText(newText);
        step += 1;
        window.setTimeout(animateStep, 80);
      } else {
        setDisplayText(nextText);
        setCurrentIndex(nextIndex);
        setIsAnimating(false);
      }
    };

    animateStep();
  }, [currentIndex, texts, isAnimating]);

  useEffect(() => {
    if (texts.length <= 1) return;

    const timer = window.setInterval(morphToNext, interval);
    return () => window.clearInterval(timer);
  }, [morphToNext, interval, texts.length]);

  const handleMouseEnter = () => {
    if (glitchOnHover) {
      setIsHovered(true);
      window.setTimeout(() => setIsHovered(false), 300);
    }
  };

  if (texts.length === 0) return null;

  return (
    <div className={cn("morphing-text-reveal", className)} onMouseEnter={handleMouseEnter}>
      <span className={cn("morphing-text-reveal__text", isHovered && glitchOnHover && "glitch-effect")}>
        {displayText.split("").map((char, index) => (
          <span
            key={`${currentIndex}-${index}`}
            className={cn("morphing-text-reveal__char", isAnimating && "morph-char")}
            style={{ animationDelay: `${index * 35}ms` }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </span>
      <span className={cn("morphing-text-reveal__cursor", isAnimating ? "is-active" : "")} />
    </div>
  );
}
