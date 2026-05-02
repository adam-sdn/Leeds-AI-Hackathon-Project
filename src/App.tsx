import { useEffect, useState } from "react";
import { bootBrowserPod } from "./browserpod";

function App() {
  const [status, setStatus] = useState("Starting...");

  useEffect(() => {
    bootBrowserPod()
      .then(() => setStatus("BrowserPod is running ✅"))
      .catch(() => setStatus("BrowserPod failed ❌"));
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <h1>Kashf.ai</h1>
      <p>{status}</p>
    </div>
  );
}

export default App;