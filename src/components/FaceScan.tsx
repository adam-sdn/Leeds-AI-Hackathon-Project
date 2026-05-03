import { useCallback, useRef, useState, useEffect } from "react";
import { processFaceScanWithBrowserPod } from "../utils/browserpodFaceProcessor";
import type { Observation, ProcessedFaceResult, RawScanData } from "../utils/browserpodFaceProcessor";
import type { AppLanguage } from "../types/language";
import { uiText } from "../utils/i18n";

export type { Observation, ProcessedFaceResult as FaceScanResult };

type FaceMeshPoint = {
  x: number;
  y: number;
  z?: number;
};

type FaceMeshResults = {
  multiFaceLandmarks?: FaceMeshPoint[][];
};

type FaceMeshInstance = {
  setOptions: (options: {
    maxNumFaces: number;
    refineLandmarks: boolean;
    minDetectionConfidence: number;
    minTrackingConfidence: number;
  }) => void;
  onResults: (callback: (results: FaceMeshResults) => void) => void;
  send: (input: { image: HTMLVideoElement }) => Promise<void>;
  close: () => void;
};

type FaceMeshConstructor = new (options: {
  locateFile: (file: string) => string;
}) => FaceMeshInstance;

declare global {
  interface Window {
    FaceMesh?: FaceMeshConstructor;
  }
}

type Props = {
  onScanComplete?: (result: ProcessedFaceResult) => void;
  language: AppLanguage;
};

type ScanStatus = 
  | "idle" 
  | "requesting permission" 
  | "detecting face"
  | "scanning" 
  | "complete"
  | "error";

export default function FaceScan({ onScanComplete, language }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  const faceMeshRef = useRef<FaceMeshInstance | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const frameCountRef = useRef<number>(0);
  const facesDetectedRef = useRef<number>(0);
  const statusRef = useRef<ScanStatus>("idle");
  
  const [status, setStatus] = useState<ScanStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(10);
  const [scanResult, setScanResult] = useState<ProcessedFaceResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const stopCamera = () => {
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const captureFinalFrame = (): string => {
    if (!videoRef.current || !canvasRef.current) return "";
    
    // Use a temporary canvas to capture the raw video frame (without the mesh overlay)
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = videoRef.current.videoWidth;
    tempCanvas.height = videoRef.current.videoHeight;
    const ctx = tempCanvas.getContext("2d");
    if (!ctx) return "";
    
    // Draw current video frame
    ctx.drawImage(videoRef.current, 0, 0, tempCanvas.width, tempCanvas.height);
    return tempCanvas.toDataURL("image/jpeg", 0.8);
  };

  const handleScanComplete = async () => {
    setIsProcessing(true);
    
    const finalImage = captureFinalFrame();
    const totalFrames = frameCountRef.current;
    const detectedFrames = facesDetectedRef.current;
    stopCamera();
    
    let quality = "Limited";
    if (totalFrames > 0) {
      const ratio = detectedFrames / totalFrames;
      if (ratio > 0.8) quality = "Good";
      else if (ratio > 0.4) quality = "Fair";
    }

    // Initial observations from local frontend logic. Keep these cautious:
    // visible wellness signals are supporting context, never a health verdict.
    const baseObservations: Observation[] = [];

    if (quality === "Good") {
      baseObservations.push({
        type: "face_mesh_tracked",
        label: "Face mesh tracked clearly for visible wellness context",
        confidence: "high",
        region: "full face",
        note: "This confirms scan quality only. It is not a healthy result or a diagnosis."
      });
    } else {
      baseObservations.push({
        type: "limited_face_detection",
        label: "Limited facial signal quality",
        confidence: "moderate",
        region: "full face",
        note: "Lighting, camera angle, or face visibility limited the scan. Do not treat this as reassuring."
      });
    }

    const rawData: RawScanData = {
      imageBase64: finalImage,
      scanQuality: quality,
      framesCaptured: totalFrames,
      timestamp: new Date().toISOString(),
      landmarksAvailable: detectedFrames > 0,
      observations: baseObservations
    };

    try {
      const result = await processFaceScanWithBrowserPod(rawData);
      setScanResult(result);
      setStatus("complete");
      if (onScanComplete) {
        onScanComplete(result);
      }
    } catch (err) {
      console.error("Failed to process scan with BrowserPod:", err);
      setStatus("error");
      setError("Processing failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const startCamera = async () => {
    setStatus("requesting permission");
    setError(null);
    setScanResult(null);
    setCountdown(10);
    frameCountRef.current = 0;
    facesDetectedRef.current = 0;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setStatus("detecting face");
      }
    } catch (err: unknown) {
      console.error("Camera access denied or failed:", err);
      setStatus("error");
      setError(err instanceof Error ? err.message : "Failed to access camera. Please check permissions.");
    }
  };

  const beginTimedScan = () => {
    if (timerRef.current || statusRef.current === "scanning") return;
    setStatus("scanning");
    setCountdown(10);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          setTimeout(() => {
            handleScanComplete();
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const initFaceMesh = () => {
    const FaceMesh = window.FaceMesh;
    if (!FaceMesh) {
      console.error("MediaPipe FaceMesh not loaded from CDN.");
      setStatus("error");
      setError("Face mesh library failed to load.");
      return;
    }

    const faceMesh = new FaceMesh({
      locateFile: (file: string) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.onResults((results) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (videoRef.current) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      frameCountRef.current += 1;

      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        facesDetectedRef.current += 1;
        if (statusRef.current === "detecting face") {
          beginTimedScan();
        }
        results.multiFaceLandmarks.forEach((landmarks) => {
          
          // Subtle dots for full mesh
          landmarks.forEach((point) => {
            ctx.beginPath();
            ctx.arc(
              point.x * canvas.width,
              point.y * canvas.height,
              1.2,
              0,
              2 * Math.PI
            );
            ctx.fillStyle = "rgba(96, 165, 250, 0.6)"; // #60A5FA light blue
            ctx.fill();
          });

          // Draw symmetry line (nose bridge to chin)
          const symmetryPoints = [10, 151, 9, 8, 168, 6, 197, 195, 5, 4, 1, 19, 94, 2, 164, 0, 11, 12, 13, 14, 15, 16, 17, 18, 200, 199, 175, 152];
          ctx.beginPath();
          ctx.strokeStyle = "rgba(96, 165, 250, 0.9)";
          ctx.lineWidth = 1.5;
          symmetryPoints.forEach((idx, i) => {
            const p = landmarks[idx];
            if (p) {
              if (i === 0) ctx.moveTo(p.x * canvas.width, p.y * canvas.height);
              else ctx.lineTo(p.x * canvas.width, p.y * canvas.height);
            }
          });
          ctx.stroke();

          // Draw Lips outline
          const lipOuter = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95];
          ctx.beginPath();
          ctx.strokeStyle = "rgba(96, 165, 250, 0.8)";
          ctx.lineWidth = 1.5;
          lipOuter.forEach((idx, i) => {
            const p = landmarks[idx];
            if (p) {
              if (i === 0) ctx.moveTo(p.x * canvas.width, p.y * canvas.height);
              else ctx.lineTo(p.x * canvas.width, p.y * canvas.height);
            }
          });
          ctx.closePath();
          ctx.stroke();
          ctx.fillStyle = "rgba(96, 165, 250, 0.2)";
          ctx.fill();

          // Helper to draw soft zones for cheeks/under-eyes
          const drawZone = (idx: number, radius: number) => {
            const p = landmarks[idx];
            if (p) {
              const x = p.x * canvas.width;
              const y = p.y * canvas.height;
              const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
              grad.addColorStop(0, "rgba(96, 165, 250, 0.4)");
              grad.addColorStop(1, "rgba(96, 165, 250, 0)");
              ctx.fillStyle = grad;
              ctx.beginPath();
              ctx.arc(x, y, radius, 0, 2 * Math.PI);
              ctx.fill();
            }
          };

          drawZone(111, 45); // Left cheek/under-eye area
          drawZone(340, 45); // Right cheek/under-eye area

          const drawLabel = (label: string, idx: number, offsetX: number, offsetY: number) => {
            const p = landmarks[idx];
            if (!p) return;

            const visualX = canvas.width - (p.x * canvas.width) + offsetX;
            const visualY = p.y * canvas.height + offsetY;
            const paddingX = 8;
            const height = 24;

            ctx.save();
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
            ctx.font = "700 12px 'SF Pro Display', system-ui, sans-serif";
            ctx.textBaseline = "middle";

            const width = ctx.measureText(label).width + paddingX * 2;
            const x = Math.max(8, Math.min(canvas.width - width - 8, visualX));
            const y = Math.max(12, Math.min(canvas.height - height - 8, visualY));

            ctx.fillStyle = "rgba(3, 17, 42, 0.82)";
            ctx.strokeStyle = "rgba(125, 211, 252, 0.62)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            if (typeof ctx.roundRect === "function") {
              ctx.roundRect(x, y, width, height, 9);
            } else {
              ctx.rect(x, y, width, height);
            }
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = "#E0F2FE";
            ctx.fillText(label, x + paddingX, y + height / 2);
            ctx.restore();
          };

          drawLabel("LEFT EYE", 263, 44, -34);
          drawLabel("RIGHT EYE", 33, -132, -34);
          drawLabel("NOSE", 1, 52, 4);
          drawLabel("MOUTH", 13, -116, 26);
        });
      }
    });

    faceMeshRef.current = faceMesh;
  };

  const processVideoFrame = useCallback(async function frame() {
    if (
      (status === "scanning" || status === "detecting face") &&
      videoRef.current && 
      faceMeshRef.current && 
      videoRef.current.readyState >= 2
    ) {
      try {
        await faceMeshRef.current.send({ image: videoRef.current });
      } catch (err) {
        console.error("FaceMesh processing error:", err);
      }
    }
    if (status === "scanning" || status === "detecting face") {
      requestRef.current = requestAnimationFrame(frame);
    }
  }, [status]);

  const handleVideoLoadedMetadata = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;

    if (!faceMeshRef.current) {
      initFaceMesh();
    }

    if (!requestRef.current) {
      requestRef.current = requestAnimationFrame(processVideoFrame);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if ((status === "scanning" || status === "detecting face") && !requestRef.current && video && video.readyState >= 2) {
      requestRef.current = requestAnimationFrame(processVideoFrame);
    }
  }, [status, processVideoFrame]);

  useEffect(() => {
    return () => {
      stopCamera();
      if (faceMeshRef.current) {
        faceMeshRef.current.close();
      }
    };
  }, []);

  return (
    <div className="face-scan-panel" style={{ textAlign: "center", width: "100%", maxWidth: "680px", margin: "0 auto" }}>
      <h2 style={{ color: "#EAF4FF", marginBottom: "8px" }}>{uiText(language, "faceTitle")}</h2>
      
      <div style={{ 
        background: "linear-gradient(145deg, rgba(8, 35, 72, 0.78), rgba(3, 14, 34, 0.72))", 
        border: "1px solid rgba(147, 197, 253, 0.28)", 
        padding: "16px", 
        borderRadius: "20px", 
        marginBottom: "20px",
        boxShadow: "0 18px 54px rgba(2, 6, 23, 0.28), inset 0 1px 0 rgba(255,255,255,0.12)",
        backdropFilter: "blur(18px)"
      }}>
        <p style={{ color: "#BAE6FD", fontWeight: 700, margin: 0 }}>
          {uiText(language, "status")}: <span style={{ 
            color: status === "scanning" ? "#2F6FED" : 
                   status === "complete" ? "#22C55E" : 
                   status === "error" ? "#FCA5A5" : "#EAF4FF" 
          }}>
            {status === "idle" && uiText(language, "ready")}
            {status === "requesting permission" && uiText(language, "requestingCamera")}
            {status === "detecting face" && uiText(language, "lookingForFace")}
            {status === "scanning" && (isProcessing ? uiText(language, "finalizing") : `${uiText(language, "scanning")} ${countdown}s ${uiText(language, "remaining")}`)}
            {status === "complete" && uiText(language, "scanComplete")}
            {status === "error" && uiText(language, "error")}
          </span>
        </p>
      </div>

      {status === "idle" && (
        <button 
          onClick={startCamera}
          style={{
            padding: "12px 32px",
            background: "linear-gradient(135deg, #0EA5E9, #2563EB)",
            color: "white",
            border: "1px solid rgba(186, 230, 253, 0.38)",
            borderRadius: "16px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
            marginBottom: "24px",
            boxShadow: "0 18px 42px rgba(37, 99, 235, 0.28)",
          }}
        >
          {uiText(language, "startFaceScan")}
        </button>
      )}

      {(status === "scanning" || status === "detecting face") && (
        <button 
          onClick={handleScanComplete}
          style={{
            padding: "12px 32px",
            backgroundColor: "#EF4444",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
            marginBottom: "24px",
          }}
        >
          {uiText(language, "stopScan")}
        </button>
      )}

      {error && (
        <div style={{ padding: "16px", backgroundColor: "#FEF2F2", color: "#991B1B", borderRadius: "8px", marginBottom: "20px" }}>
          {error}
        </div>
      )}

      {/* Video Container */}
      {(status === "requesting permission" || status === "detecting face" || status === "scanning") && (
        <div 
          style={{ 
            position: "relative", 
            width: "100%", 
            maxWidth: "640px",
            aspectRatio: "4/3",
            margin: "0 auto",
            borderRadius: "16px",
            overflow: "hidden",
            backgroundColor: "#0F172A",
            boxShadow: "0 10px 25px rgba(15, 23, 42, 0.1)",
            marginBottom: "24px"
          }}
        >
          <video 
            ref={videoRef} 
            onLoadedMetadata={handleVideoLoadedMetadata}
            playsInline
            muted
            style={{ 
              width: "100%", 
              height: "100%", 
              objectFit: "cover",
              display: "block",
              transform: "scaleX(-1)"
            }} 
          />
          <canvas
            ref={canvasRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              pointerEvents: "none",
              transform: "scaleX(-1)"
            }}
          />
        </div>
      )}

      {/* Results View */}
      {status === "complete" && scanResult && (
        <div style={{
          background: "linear-gradient(145deg, rgba(8, 35, 72, 0.78), rgba(3, 14, 34, 0.72))",
          border: "1px solid rgba(147, 197, 253, 0.28)",
          borderRadius: "22px",
          padding: "32px 24px",
          textAlign: "center",
          boxShadow: "0 18px 54px rgba(2, 6, 23, 0.28), inset 0 1px 0 rgba(255,255,255,0.12)",
          marginBottom: "24px"
        }}>
          <div style={{ fontSize: "40px", marginBottom: "16px" }}>✅</div>
          <h3 style={{ margin: "0 0 12px 0", color: "#EAF4FF", fontSize: "20px" }}>{uiText(language, "faceScanSaved")}</h3>
          
          <div style={{ display: "inline-flex", gap: "16px", marginBottom: "20px", fontSize: "14px", fontWeight: 700, background: "rgba(3, 17, 42, 0.62)", padding: "8px 16px", borderRadius: "999px", border: "1px solid rgba(147, 197, 253, 0.26)" }}>
            <span style={{ color: "#E0F2FE" }}>{uiText(language, "quality")}: <span style={{ color: scanResult.scanQuality === "Good" ? "#86EFAC" : "#FCD34D" }}>{scanResult.scanQuality}</span></span>
            <span style={{ color: "#64748B" }}>|</span>
            <span style={{ color: "#E0F2FE" }}>{uiText(language, "processed")}</span>
          </div>

          <div style={{ background: "rgba(14, 165, 233, 0.12)", border: "1px solid rgba(125, 211, 252, 0.26)", padding: "16px", borderRadius: "16px", marginBottom: "24px", textAlign: "left" }}>
            <p style={{ color: "#BAE6FD", margin: 0, fontSize: "14px", lineHeight: "1.5" }}>
              <strong>Note:</strong> {uiText(language, "faceNote")}
            </p>
          </div>
          
          <button 
            onClick={startCamera}
            style={{
              padding: "10px 24px",
              backgroundColor: "transparent",
              color: "#E0F2FE",
              border: "1px solid rgba(147, 197, 253, 0.34)",
              borderRadius: "14px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {uiText(language, "rescanFace")}
          </button>
        </div>
      )}
    </div>
  );
}
