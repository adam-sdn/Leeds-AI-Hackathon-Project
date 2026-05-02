import { BrowserPod } from "@leaningtech/browserpod";

export async function bootBrowserPod() {
  try {
    const pod = await BrowserPod.boot({
      apiKey: import.meta.env.VITE_BP_APIKEY,
    });

    console.log("BrowserPod booted successfully");
    return pod;
  } catch (err) {
    console.error("BrowserPod failed:", err);
  }
}