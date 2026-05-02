import { useRef, useState, useEffect } from "react";

export type Observation = {
  type: string;
  label: string;
  confidence: "low" | "moderate" | "high";
  region: string;
  note: string;
};

export type FaceScanResult = {
  scanId: string;
  timestamp: string;
  durationSeconds: number;
  observations: Observation[];
  summary: string;
};

type Props = {
  onScanComplete?: (result: FaceScanResult) => void;
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
  
  const [status, setStatus] = useState<ScanStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(10);
  const [scanResult, setScanResult] = useState<FaceScanResult | null>(null);

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

  const generateMockResult = (): FaceScanResult => {
    return {
      scanId: `scan-${Date.now()}`,
      timestamp: new Date().toISOString(),
      durationSeconds: 10,
      observations: [
        {
          type: "under_eye_darkness",
          label: "Possible under-eye darkness",
          confidence: "moderate",
          region: "under eyes",
          note: "Visible wellness observation only, not a diagnosis."
        },
        {
          type: "facial_tiredness",
          label: "Possible facial tiredness cue",
          confidence: "low",
          region: "full face",
          note: "Visible wellness observation only, not a diagnosis."
        },
        {
          type: "symmetry",
          label: "No major facial asymmetry observed",
          confidence: "high",
          region: "full face",
          note: "Visible wellness observation only, not a diagnosis."
        },
        {
          type: "cheek_redness",
          label: "Possible cheek redness cue",
          confidence: "low",
          region: "cheeks",
          note: "Visible wellness observation only, not a diagnosis."
        },
        {
          type: "lip_dryness",
          label: "Possible lip dryness cue",
          confidence: "moderate",
          region: "lips",
          note: "Visible wellness observation only, not a diagnosis."
        }
      ],
      summary: "Scan completed successfully. Some mild signs of tiredness were observed. These are wellness signals only."
    };
  };

  const handleScanComplete = () => {
    stopCamera();
    const result = generateMockResult();
    setScanResult(result);
    setStatus("complete");
    if (onScanComplete) {
      onScanComplete(result);
    }
  };

  const startCamera = async () => {
    setStatus("requesting permission");
    setError(null);
    setScanResult(null);
    setCountdown(10);

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
              handleScanComplete();
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

      if (results.multiFaceLandmarks) {
        results.multiFaceLandmarks.forEach((landmarks: any[]) => {
          landmarks.forEach((point) => {
            ctx.beginPath();
            ctx.arc(
              point.x * canvas.width,
              point.y * canvas.height,
              1.5,
              0,
              2 * Math.PI
            );
            ctx.fillStyle = "#60A5FA";
            ctx.fill();
          });
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
            {status === "scanning" && `Scanning... ${countdown}s remaining`}
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
          <p style={{ color: "#334155", margin: "0 0 24px 0", fontSize: "16px", lineHeight: "1.5" }}>
            Kashf will include these wellness observations in your results.
          </p>

          <p style={{ fontSize: "13px", color: "#64748B", fontStyle: "italic", margin: 0, borderTop: "1px solid #E2E8F0", paddingTop: "16px" }}>
            Facial scan observations are visible wellness signals only and are not a medical diagnosis.
          </p>
        </div>
      )}
    </div>
  );
}