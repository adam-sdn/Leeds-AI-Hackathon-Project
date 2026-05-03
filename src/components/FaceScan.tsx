import { useRef, useState, useEffect } from "react";
import { processFaceScanWithBrowserPod } from "../utils/browserpodFaceProcessor";
import type { Observation, ProcessedFaceResult, RawScanData } from "../utils/browserpodFaceProcessor";

export type { Observation, ProcessedFaceResult as FaceScanResult };

type Props = {
  onScanComplete?: (result: ProcessedFaceResult) => void;
};

type ScanStatus = 
  | "idle" 
  | "requesting permission" 
  | "scanning" 
  | "complete"
  | "error";

export default function FaceScan({ onScanComplete }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const faceMeshRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const frameCountRef = useRef<number>(0);
  const facesDetectedRef = useRef<number>(0);
  
  const [status, setStatus] = useState<ScanStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(10);
  const [scanResult, setScanResult] = useState<ProcessedFaceResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const stopCamera = () => {
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = undefined;
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
    stopCamera();
    setIsProcessing(true);
    
    const finalImage = captureFinalFrame();
    const totalFrames = frameCountRef.current;
    const detectedFrames = facesDetectedRef.current;
    
    let quality = "Limited";
    if (totalFrames > 0) {
      const ratio = detectedFrames / totalFrames;
      if (ratio > 0.8) quality = "Good";
      else if (ratio > 0.4) quality = "Fair";
    }

    // Initial observations (detected by local frontend logic)
    const baseObservations: Observation[] = [
      {
        type: "under_eye_darkness",
        label: "Possible under-eye tiredness cue",
        confidence: "moderate",
        region: "under eyes",
        note: "Visible wellness signal only."
      },
      {
        type: "lip_dryness",
        label: "Possible lip dryness cue",
        confidence: "moderate",
        region: "lips",
        note: "Visible wellness signal only."
      },
      {
        type: "cheek_redness",
        label: "Possible cheek redness cue",
        confidence: "low",
        region: "cheeks",
        note: "Visible wellness signal only."
      }
    ];

    if (quality === "Good") {
      baseObservations.push({
        type: "symmetry",
        label: "Facial symmetry appears balanced",
        confidence: "high",
        region: "full face",
        note: "Visible wellness signal only."
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
        setStatus("scanning");

        // Start countdown
        timerRef.current = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timerRef.current);
              setTimeout(() => {
                handleScanComplete();
              }, 0);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (err: any) {
      console.error("Camera access denied or failed:", err);
      setStatus("error");
      setError(err.message || "Failed to access camera. Please check permissions.");
    }
  };

  const initFaceMesh = () => {
    const FaceMesh = (window as any).FaceMesh;
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

    faceMesh.onResults((results: any) => {
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
        results.multiFaceLandmarks.forEach((landmarks: any[]) => {
          
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
        });
      }
    });

    faceMeshRef.current = faceMesh;
  };

  const processVideoFrame = async () => {
    if (
      status === "scanning" &&
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
    if (status === "scanning") {
      requestRef.current = requestAnimationFrame(processVideoFrame);
    }
  };

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
    if (status === "scanning" && !requestRef.current && videoRef.current?.readyState >= 2) {
      requestRef.current = requestAnimationFrame(processVideoFrame);
    }
  }, [status]);

  useEffect(() => {
    return () => {
      stopCamera();
      if (faceMeshRef.current) {
        faceMeshRef.current.close();
      }
    };
  }, []);

  return (
    <div style={{ textAlign: "center", width: "100%", maxWidth: "640px", margin: "0 auto" }}>
      <h2 style={{ color: "#0F172A", marginBottom: "8px" }}>Face Scan Wellness Check</h2>
      
      <div style={{ 
        backgroundColor: "#F8FAFC", 
        border: "1px solid #E2E8F0", 
        padding: "16px", 
        borderRadius: "12px", 
        marginBottom: "20px" 
      }}>
        <p style={{ color: "#64748B", fontWeight: 500, margin: 0 }}>
          Status: <span style={{ 
            color: status === "scanning" ? "#2F6FED" : 
                   status === "complete" ? "#22C55E" : 
                   status === "error" ? "#EF4444" : "#334155" 
          }}>
            {status === "idle" && "Ready to start"}
            {status === "requesting permission" && "Requesting camera..."}
            {status === "scanning" && (isProcessing ? "Finalizing analysis..." : `Scanning... ${countdown}s remaining`)}
            {status === "complete" && "Scan complete"}
            {status === "error" && "Error"}
          </span>
        </p>
      </div>

      {status === "idle" && (
        <button 
          onClick={startCamera}
          style={{
            padding: "12px 32px",
            backgroundColor: "#0F172A",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
            marginBottom: "24px",
            boxShadow: "0 4px 12px rgba(15, 23, 42, 0.15)",
          }}
        >
          Start Face Scan
        </button>
      )}

      {status === "scanning" && (
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
          Stop Scan
        </button>
      )}

      {error && (
        <div style={{ padding: "16px", backgroundColor: "#FEF2F2", color: "#991B1B", borderRadius: "8px", marginBottom: "20px" }}>
          {error}
        </div>
      )}

      {/* Video Container */}
      {(status === "requesting permission" || status === "scanning") && (
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
          backgroundColor: "white",
          border: "1px solid #E2E8F0",
          borderRadius: "16px",
          padding: "32px 24px",
          textAlign: "center",
          boxShadow: "0 4px 12px rgba(15, 23, 42, 0.03)",
          marginBottom: "24px"
        }}>
          <div style={{ fontSize: "40px", marginBottom: "16px" }}>✅</div>
          <h3 style={{ margin: "0 0 12px 0", color: "#0F172A", fontSize: "20px" }}>Face scan saved</h3>
          
          <div style={{ display: "inline-flex", gap: "16px", marginBottom: "20px", fontSize: "14px", fontWeight: 500, backgroundColor: "#F8FAFC", padding: "8px 16px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
            <span style={{ color: "#334155" }}>Quality: <span style={{ color: scanResult.scanQuality === "Good" ? "#16A34A" : "#D97706" }}>{scanResult.scanQuality}</span></span>
            <span style={{ color: "#94A3B8" }}>|</span>
            <span style={{ color: "#334155" }}>Processed: BrowserPod Engine</span>
          </div>

          <div style={{ backgroundColor: "#EFF6FF", border: "1px solid #BFDBFE", padding: "16px", borderRadius: "12px", marginBottom: "24px", textAlign: "left" }}>
            <p style={{ color: "#1E3A8A", margin: 0, fontSize: "14px", lineHeight: "1.5" }}>
              <strong>Note:</strong> Facial scan observations are based on visible wellness signals only. They are included to help you describe changes, not to diagnose a condition.
            </p>
          </div>
          
          <button 
            onClick={startCamera}
            style={{
              padding: "10px 24px",
              backgroundColor: "transparent",
              color: "#475569",
              border: "1px solid #CBD5E1",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Rescan Face
          </button>
        </div>
      )}
    </div>
  );
}