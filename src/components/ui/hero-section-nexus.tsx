"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
  type ReactNode,
  type MouseEvent as ReactMouseEvent,
} from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  type Target,
  type TargetAndTransition,
  type Transition,
  type VariantLabels,
  type Variants,
} from "framer-motion";
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  ChevronDown,
  HeartPulse,
  Menu,
  ScanFace,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { ContainerScroll } from "./container-scroll-animation";

interface RotatingTextRef {
  next: () => void;
  previous: () => void;
  jumpTo: (index: number) => void;
  reset: () => void;
}

interface RotatingTextProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof motion.span>,
    "children" | "transition" | "initial" | "animate" | "exit"
  > {
  texts: string[];
  transition?: Transition;
  initial?: boolean | Target | VariantLabels;
  animate?: boolean | VariantLabels | Target | TargetAndTransition;
  exit?: Target | VariantLabels;
  animatePresenceMode?: "sync" | "wait";
  animatePresenceInitial?: boolean;
  rotationInterval?: number;
  staggerDuration?: number;
  staggerFrom?: "first" | "last" | "center" | "random" | number;
  loop?: boolean;
  auto?: boolean;
  splitBy?: "characters" | "words" | "lines" | string;
  onNext?: (index: number) => void;
  mainClassName?: string;
  splitLevelClassName?: string;
  elementLevelClassName?: string;
}

const RotatingText = forwardRef<RotatingTextRef, RotatingTextProps>(
  (
    {
      texts,
      transition = { type: "spring", damping: 25, stiffness: 300 },
      initial = { y: "100%", opacity: 0 },
      animate = { y: 0, opacity: 1 },
      exit = { y: "-120%", opacity: 0 },
      animatePresenceMode = "wait",
      animatePresenceInitial = false,
      rotationInterval = 2200,
      staggerDuration = 0.01,
      staggerFrom = "last",
      loop = true,
      auto = true,
      splitBy = "characters",
      onNext,
      mainClassName,
      splitLevelClassName,
      elementLevelClassName,
      ...rest
    },
    ref
  ) => {
    const [currentTextIndex, setCurrentTextIndex] = useState<number>(0);

    const splitIntoCharacters = (text: string): string[] => {
      if (typeof Intl !== "undefined" && Intl.Segmenter) {
        try {
          const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
          return Array.from(segmenter.segment(text), (segment) => segment.segment);
        } catch {
          return text.split("");
        }
      }

      return text.split("");
    };

    const elements = useMemo(() => {
      const currentText = texts[currentTextIndex] ?? "";

      if (splitBy === "characters") {
        const words = currentText.split(/(\s+)/);
        let charCount = 0;
        return words
          .filter((part) => part.length > 0)
          .map((part) => {
            const isSpace = /^\s+$/.test(part);
            const chars = isSpace ? [part] : splitIntoCharacters(part);
            const startIndex = charCount;
            charCount += chars.length;
            return { characters: chars, isSpace, startIndex };
          });
      }

      if (splitBy === "words") {
        return currentText
          .split(/(\s+)/)
          .filter((word) => word.length > 0)
          .map((word, index) => ({
            characters: [word],
            isSpace: /^\s+$/.test(word),
            startIndex: index,
          }));
      }

      if (splitBy === "lines") {
        return currentText.split("\n").map((line, index) => ({
          characters: [line],
          isSpace: false,
          startIndex: index,
        }));
      }

      return currentText.split(splitBy).map((part, index) => ({
        characters: [part],
        isSpace: false,
        startIndex: index,
      }));
    }, [texts, currentTextIndex, splitBy]);

    const totalElements = useMemo(
      () => elements.reduce((sum, element) => sum + element.characters.length, 0),
      [elements]
    );

    const getStaggerDelay = useCallback(
      (index: number, total: number): number => {
        if (total <= 1 || !staggerDuration) return 0;

        switch (staggerFrom) {
          case "first":
            return index * staggerDuration;
          case "last":
            return (total - 1 - index) * staggerDuration;
          case "center": {
            const center = (total - 1) / 2;
            return Math.abs(center - index) * staggerDuration;
          }
          case "random":
            return Math.random() * (total - 1) * staggerDuration;
          default:
            if (typeof staggerFrom === "number") {
              const fromIndex = Math.max(0, Math.min(staggerFrom, total - 1));
              return Math.abs(fromIndex - index) * staggerDuration;
            }
            return index * staggerDuration;
        }
      },
      [staggerFrom, staggerDuration]
    );

    const handleIndexChange = useCallback(
      (newIndex: number) => {
        setCurrentTextIndex(newIndex);
        onNext?.(newIndex);
      },
      [onNext]
    );

    const next = useCallback(() => {
      const nextIndex =
        currentTextIndex === texts.length - 1 ? (loop ? 0 : currentTextIndex) : currentTextIndex + 1;
      if (nextIndex !== currentTextIndex) handleIndexChange(nextIndex);
    }, [currentTextIndex, texts.length, loop, handleIndexChange]);

    const previous = useCallback(() => {
      const previousIndex =
        currentTextIndex === 0 ? (loop ? texts.length - 1 : currentTextIndex) : currentTextIndex - 1;
      if (previousIndex !== currentTextIndex) handleIndexChange(previousIndex);
    }, [currentTextIndex, texts.length, loop, handleIndexChange]);

    const jumpTo = useCallback(
      (index: number) => {
        const validIndex = Math.max(0, Math.min(index, texts.length - 1));
        if (validIndex !== currentTextIndex) handleIndexChange(validIndex);
      },
      [texts.length, currentTextIndex, handleIndexChange]
    );

    const reset = useCallback(() => {
      if (currentTextIndex !== 0) handleIndexChange(0);
    }, [currentTextIndex, handleIndexChange]);

    useImperativeHandle(ref, () => ({ next, previous, jumpTo, reset }), [
      next,
      previous,
      jumpTo,
      reset,
    ]);

    useEffect(() => {
      if (!auto || texts.length <= 1) return;
      const intervalId = window.setInterval(next, rotationInterval);
      return () => window.clearInterval(intervalId);
    }, [next, rotationInterval, auto, texts.length]);

    return (
      <motion.span className={cn("rotating-text", mainClassName)} {...rest} layout>
        <span className="sr-only">{texts[currentTextIndex]}</span>
        <AnimatePresence mode={animatePresenceMode} initial={animatePresenceInitial}>
          <motion.span
            key={currentTextIndex}
            className={cn("rotating-text__row", splitBy === "lines" && "rotating-text__row--lines")}
            layout
            aria-hidden="true"
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {elements.map((elementObj, elementIndex) => (
              <span
                key={elementIndex}
                className={cn("rotating-text__group", splitLevelClassName)}
                style={{ whiteSpace: "pre" }}
              >
                {elementObj.characters.map((char, charIndex) => {
                  const globalIndex = elementObj.startIndex + charIndex;
                  return (
                    <motion.span
                      key={`${char}-${charIndex}`}
                      initial={initial}
                      animate={animate}
                      exit={exit}
                      transition={{
                        ...transition,
                        delay: getStaggerDelay(globalIndex, totalElements),
                      }}
                      className={cn("rotating-text__char", elementLevelClassName)}
                    >
                      {char === " " ? "\u00A0" : char}
                    </motion.span>
                  );
                })}
              </span>
            ))}
          </motion.span>
        </AnimatePresence>
      </motion.span>
    );
  }
);

RotatingText.displayName = "RotatingText";

const ShinyText = ({ text, className = "" }: { text: string; className?: string }) => (
  <span className={cn("shiny-text", className)}>{text}</span>
);

type NavLinkProps = {
  href?: string;
  children: ReactNode;
  hasDropdown?: boolean;
  className?: string;
  onClick?: (event: ReactMouseEvent<HTMLAnchorElement>) => void;
};

const NavLink = ({ href = "#", children, hasDropdown = false, className = "", onClick }: NavLinkProps) => (
  <motion.a href={href} onClick={onClick} className={cn("hero-nav-link", className)} whileHover="hover">
    {children}
    {hasDropdown && <ChevronDown size={14} strokeWidth={2.2} />}
    {!hasDropdown && (
      <motion.span
        className="hero-nav-link__underline"
        variants={{ initial: { scaleX: 0 }, hover: { scaleX: 1 } }}
        initial="initial"
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
    )}
  </motion.a>
);

type Dot = {
  x: number;
  y: number;
  targetOpacity: number;
  currentOpacity: number;
  opacitySpeed: number;
  baseRadius: number;
  currentRadius: number;
};

type InteractiveHeroProps = {
  onStartAnalysis: () => void;
};

const InteractiveHero = ({ onStartAnalysis }: InteractiveHeroProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 10);
  });

  const dotsRef = useRef<Dot[]>([]);
  const gridRef = useRef<Record<string, number[]>>({});
  const canvasSizeRef = useRef({ width: 0, height: 0 });
  const mousePositionRef = useRef<{ x: number | null; y: number | null }>({ x: null, y: null });

  const dotSpacing = 25;
  const baseOpacityMin = 0.16;
  const baseOpacityMax = 0.38;
  const baseRadius = 1;
  const interactionRadius = 150;
  const interactionRadiusSq = interactionRadius * interactionRadius;
  const opacityBoost = 0.62;
  const radiusBoost = 2.4;
  const gridCellSize = Math.max(50, Math.floor(interactionRadius / 1.5));

  const handleMouseMove = useCallback((event: globalThis.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      mousePositionRef.current = { x: null, y: null };
      return;
    }

    const rect = canvas.getBoundingClientRect();
    mousePositionRef.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }, []);

  const createDots = useCallback(() => {
    const { width, height } = canvasSizeRef.current;
    if (width === 0 || height === 0) return;

    const newDots: Dot[] = [];
    const newGrid: Record<string, number[]> = {};
    const cols = Math.ceil(width / dotSpacing);
    const rows = Math.ceil(height / dotSpacing);

    for (let i = 0; i < cols; i += 1) {
      for (let j = 0; j < rows; j += 1) {
        const x = i * dotSpacing + dotSpacing / 2;
        const y = j * dotSpacing + dotSpacing / 2;
        const cellKey = `${Math.floor(x / gridCellSize)}_${Math.floor(y / gridCellSize)}`;

        if (!newGrid[cellKey]) newGrid[cellKey] = [];
        const dotIndex = newDots.length;
        newGrid[cellKey].push(dotIndex);

        const baseOpacity = Math.random() * (baseOpacityMax - baseOpacityMin) + baseOpacityMin;
        newDots.push({
          x,
          y,
          targetOpacity: baseOpacity,
          currentOpacity: baseOpacity,
          opacitySpeed: Math.random() * 0.005 + 0.002,
          baseRadius,
          currentRadius: baseRadius,
        });
      }
    }

    dotsRef.current = newDots;
    gridRef.current = newGrid;
  }, [dotSpacing, gridCellSize, baseOpacityMin, baseOpacityMax, baseRadius]);

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = canvas.parentElement;
    const width = container ? container.clientWidth : window.innerWidth;
    const height = container ? container.clientHeight : window.innerHeight;

    if (
      canvas.width !== width ||
      canvas.height !== height ||
      canvasSizeRef.current.width !== width ||
      canvasSizeRef.current.height !== height
    ) {
      canvas.width = width;
      canvas.height = height;
      canvasSizeRef.current = { width, height };
      createDots();
    }
  }, [createDots]);

  const animateDots = useCallback(function animateDotsFrame() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const dots = dotsRef.current;
    const grid = gridRef.current;
    const { width, height } = canvasSizeRef.current;
    const { x: mouseX, y: mouseY } = mousePositionRef.current;

    if (!ctx || !dots || !grid || width === 0 || height === 0) {
      animationFrameId.current = requestAnimationFrame(animateDotsFrame);
      return;
    }

    ctx.clearRect(0, 0, width, height);

    const activeDotIndices = new Set<number>();
    if (mouseX !== null && mouseY !== null) {
      const mouseCellX = Math.floor(mouseX / gridCellSize);
      const mouseCellY = Math.floor(mouseY / gridCellSize);
      const searchRadius = Math.ceil(interactionRadius / gridCellSize);
      for (let i = -searchRadius; i <= searchRadius; i += 1) {
        for (let j = -searchRadius; j <= searchRadius; j += 1) {
          const cellKey = `${mouseCellX + i}_${mouseCellY + j}`;
          grid[cellKey]?.forEach((dotIndex) => activeDotIndices.add(dotIndex));
        }
      }
    }

    dots.forEach((dot, index) => {
      dot.currentOpacity += dot.opacitySpeed;
      if (dot.currentOpacity >= dot.targetOpacity || dot.currentOpacity <= baseOpacityMin) {
        dot.opacitySpeed = -dot.opacitySpeed;
        dot.currentOpacity = Math.max(baseOpacityMin, Math.min(dot.currentOpacity, baseOpacityMax));
        dot.targetOpacity = Math.random() * (baseOpacityMax - baseOpacityMin) + baseOpacityMin;
      }

      let interactionFactor = 0;
      dot.currentRadius = dot.baseRadius;

      if (mouseX !== null && mouseY !== null && activeDotIndices.has(index)) {
        const dx = dot.x - mouseX;
        const dy = dot.y - mouseY;
        const distSq = dx * dx + dy * dy;

        if (distSq < interactionRadiusSq) {
          const distance = Math.sqrt(distSq);
          interactionFactor = Math.max(0, 1 - distance / interactionRadius);
          interactionFactor *= interactionFactor;
        }
      }

      const finalOpacity = Math.min(1, dot.currentOpacity + interactionFactor * opacityBoost);
      dot.currentRadius = dot.baseRadius + interactionFactor * radiusBoost;

      ctx.beginPath();
      ctx.fillStyle = `rgba(125, 211, 252, ${finalOpacity.toFixed(3)})`;
      ctx.arc(dot.x, dot.y, dot.currentRadius, 0, Math.PI * 2);
      ctx.fill();
    });

    animationFrameId.current = requestAnimationFrame(animateDotsFrame);
  }, [
    gridCellSize,
    interactionRadius,
    interactionRadiusSq,
    opacityBoost,
    radiusBoost,
    baseOpacityMin,
    baseOpacityMax,
  ]);

  useEffect(() => {
    handleResize();
    const handleMouseLeave = () => {
      mousePositionRef.current = { x: null, y: null };
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("resize", handleResize);
    document.documentElement.addEventListener("mouseleave", handleMouseLeave);
    animationFrameId.current = requestAnimationFrame(animateDots);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [handleResize, handleMouseMove, animateDots]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const headerVariants: Variants = {
    top: {
      backgroundColor: "rgba(2, 6, 23, 0.72)",
      borderBottomColor: "rgba(147, 197, 253, 0.16)",
      boxShadow: "none",
    },
    scrolled: {
      backgroundColor: "rgba(2, 6, 23, 0.94)",
      borderBottomColor: "rgba(147, 197, 253, 0.26)",
      boxShadow: "0 18px 44px rgba(2, 6, 23, 0.34)",
    },
  };

  const reveal = (delay: number): Variants => ({
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] } },
  });

  const handleAnchor = (event: ReactMouseEvent<HTMLAnchorElement>, targetId: string) => {
    event.preventDefault();
    document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="kashf-hero-shell">
      <section className="kashf-hero">
        <canvas ref={canvasRef} className="kashf-hero__canvas" />
        <div className="kashf-hero__veil" />

        <motion.header
          variants={headerVariants}
          initial="top"
          animate={isScrolled ? "scrolled" : "top"}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="kashf-hero-header"
        >
          <nav className="kashf-hero-nav">
            <a className="kashf-hero-brand" href="#top" onClick={(event) => handleAnchor(event, "top")}>
              <span className="kashf-hero-brand__mark">
                <ScanFace size={18} />
              </span>
              <span>
                kashf<span>.ai</span>
              </span>
            </a>

            <div className="kashf-hero-nav__links">
              <NavLink href="#health-analysis" onClick={(event) => handleAnchor(event, "health-analysis")}>
                Get a Health Analysis
              </NavLink>
              <NavLink href="#about-us" onClick={(event) => handleAnchor(event, "about-us")}>
                About Us
              </NavLink>
              <NavLink href="#how-it-works" hasDropdown>
                How it works
              </NavLink>
            </div>

            <div className="kashf-hero-nav__actions">
              <button className="uiverse-button uiverse-button--compact" type="button" onClick={onStartAnalysis}>
                <span className="uiverse-button__transition" />
                <span className="uiverse-button__gradient" />
                <span className="uiverse-button__label">Get Started</span>
              </button>
              <motion.button
                className="kashf-hero-menu"
                type="button"
                onClick={() => setIsMobileMenuOpen((value) => !value)}
                aria-label="Toggle menu"
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.96 }}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </motion.button>
            </div>
          </nav>

          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                key="mobile-menu"
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="kashf-mobile-menu"
              >
                <NavLink href="#health-analysis" onClick={(event) => handleAnchor(event, "health-analysis")}>
                  Get a Health Analysis
                </NavLink>
                <NavLink href="#about-us" onClick={(event) => handleAnchor(event, "about-us")}>
                  About Us
                </NavLink>
                <button className="uiverse-button" type="button" onClick={onStartAnalysis}>
                  <span className="uiverse-button__transition" />
                  <span className="uiverse-button__gradient" />
                  <span className="uiverse-button__label">Get Started</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.header>

        <main className="kashf-hero__main" id="top">
          <motion.div variants={reveal(0.2)} initial="hidden" animate="visible" className="kashf-hero__banner">
            <ShinyText text="Private AI wellness guidance in under 3 minutes" />
          </motion.div>

          <motion.h1 variants={reveal(0.32)} initial="hidden" animate="visible" className="kashf-hero__title">
            Understand your health signals with{" "}
            <span className="kashf-hero__rotating">
              <RotatingText
                texts={["clarity", "context", "confidence", "care"]}
                mainClassName="kashf-hero__accent"
                staggerFrom="last"
                initial={{ y: "-100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "110%", opacity: 0 }}
                staggerDuration={0.012}
                transition={{ type: "spring", damping: 18, stiffness: 250 }}
                rotationInterval={2200}
                splitBy="characters"
                auto
                loop
              />
            </span>
          </motion.h1>

          <motion.p variants={reveal(0.44)} initial="hidden" animate="visible" className="kashf-hero__copy">
            Kashf.ai combines a face scan, connected wellness data, and symptom reasoning to help you
            understand what your body may be signalling. It is not a diagnosis, but it gives you a calmer,
            clearer next step.
          </motion.p>

          <motion.div variants={reveal(0.56)} initial="hidden" animate="visible" className="kashf-hero__cta-row">
            <button className="uiverse-button" type="button" onClick={onStartAnalysis}>
              <span className="uiverse-button__transition" />
              <span className="uiverse-button__gradient" />
              <span className="uiverse-button__label">
                Get Started <ArrowRight size={18} />
              </span>
            </button>
            <a className="kashf-hero__ghost" href="#about-us" onClick={(event) => handleAnchor(event, "about-us")}>
              Learn about Kashf.ai
            </a>
          </motion.div>

          <motion.div variants={reveal(0.68)} initial="hidden" animate="visible" className="kashf-hero__signals">
            <span>
              <ScanFace size={16} /> Face Scan Wellness Check
            </span>
            <span>
              <Activity size={16} /> Health Data Context
            </span>
            <span>
              <BrainCircuit size={16} /> AI Reasoning
            </span>
          </motion.div>
        </main>
      </section>

      <section className="kashf-section kashf-section--analysis" id="health-analysis">
        <ContainerScroll
          titleComponent={
            <div className="scroll-title">
              <span>Get a Health Analysis</span>
              <h2>Start with a Face Scan Wellness Check.</h2>
              <p>
                The app opens on the scan first, then layers in optional health data and symptoms to build a
                more complete guidance report.
              </p>
            </div>
          }
        >
          <div className="kashf-product-preview">
            <img
              src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1400&q=80"
              alt="Clinician reviewing digital health information"
              draggable={false}
            />
            <div className="kashf-product-preview__overlay">
              <div className="preview-card preview-card--primary">
                <ScanFace size={22} />
                <div>
                  <strong>Face Scan Wellness Check</strong>
                  <span>Camera signal quality ready</span>
                </div>
              </div>
              <div className="preview-grid">
                <span>Skin tone context</span>
                <span>Visible fatigue cues</span>
                <span>Symptom history</span>
                <span>Safety flags</span>
              </div>
            </div>
          </div>
        </ContainerScroll>

        <div className="kashf-section__cta">
          <button className="uiverse-button" type="button" onClick={onStartAnalysis}>
            <span className="uiverse-button__transition" />
            <span className="uiverse-button__gradient" />
            <span className="uiverse-button__label">
              Get Started <ArrowRight size={18} />
            </span>
          </button>
        </div>
      </section>

      <section className="kashf-section kashf-section--about" id="about-us">
        <div className="about-panel">
          <span className="about-panel__eyebrow">
            <Sparkles size={16} /> About Us
          </span>
          <h2>Built for people who need a clear first read, not a wall of uncertainty.</h2>
          <p>
            Kashf.ai is a guided health analysis experience that brings visible wellness signals, personal
            symptom input, connected health context, and AI-assisted reasoning into one understandable flow.
            It helps users prepare better questions, spot when symptoms may need urgent care, and make sense
            of what to do next while keeping the product framed as guidance, not a replacement for clinicians.
          </p>
          <div className="about-panel__trust">
            <span>
              <ShieldCheck size={17} /> Safety-first triage language
            </span>
            <span>
              <HeartPulse size={17} /> Human-centred wellness context
            </span>
            <span>
              <BrainCircuit size={17} /> Multimodal AI reasoning
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default InteractiveHero;
