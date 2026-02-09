import { useState } from "react";
import { useAudioContext } from "../contexts/AudioContext";
import { Loader2 } from "lucide-react";
import { openUrl } from "@tauri-apps/plugin-opener";

export default function Login() {
  const { startAuth, pollAuth, getUserPlaylists } = useAudioContext();
  const [deviceCode, setDeviceCode] = useState<string | null>(null);
  const [userCode, setUserCode] = useState<string | null>(null);
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");

  const handleStartAuth = async () => {
    try {
      setError(null);
      setStatus("Starting authentication...");
      const code = await startAuth();
      console.log("Got device code:", code);
      setDeviceCode(code.deviceCode);
      setUserCode(code.userCode);
      setVerificationUrl(code.verificationUriComplete);
      setStatus("Please login at Tidal");

      // Start polling
      setIsPolling(true);
      pollForToken(code.deviceCode, code.interval || 5);
    } catch (err: any) {
      setError(`Failed to start authentication: ${err?.message || err}`);
      setStatus("");
      console.error("Auth start error:", err);
    }
  };

  const pollForToken = async (deviceCode: string, interval: number) => {
    const maxAttempts = 60; // 5 minutes with 5-second intervals
    let attempts = 0;

    const poll = async () => {
      try {
        setStatus(`Checking login status... (attempt ${attempts + 1})`);
        const tokens = await pollAuth(deviceCode);
        console.log("Authentication successful!", tokens);
        setStatus("Login successful! Loading playlists...");

        // Load user playlists after successful auth
        if (tokens.user_id) {
          await getUserPlaylists(tokens.user_id);
        }

        setIsPolling(false);
        setStatus("");
      } catch (err: any) {
        const errorMsg = err?.message || String(err);
        attempts++;

        // "Pending" means user hasn't logged in yet - keep polling
        if (
          errorMsg.includes("Pending") ||
          errorMsg.includes("authorization_pending")
        ) {
          if (attempts < maxAttempts) {
            setTimeout(poll, interval * 1000);
          } else {
            setIsPolling(false);
            setError("Authentication timed out. Please try again.");
            setStatus("");
          }
        } else {
          // Actual error
          setIsPolling(false);
          setError(`Authentication failed: ${errorMsg}`);
          setStatus("");
          console.error("Poll error:", err);
        }
      }
    };

    poll();
  };

  const openVerificationUrl = async () => {
    if (verificationUrl) {
      try {
        // Add https:// if not present
        const url = verificationUrl.startsWith("http")
          ? verificationUrl
          : `https://${verificationUrl}`;
        await openUrl(url);
      } catch (err) {
        // Fallback to window.open if plugin fails
        console.error("Failed to open with plugin:", err);
        const url = verificationUrl.startsWith("http")
          ? verificationUrl
          : `https://${verificationUrl}`;
        window.open(url, "_blank");
      }
    }
  };

  return (
    <div className="flex items-center justify-center h-screen w-screen bg-gradient-to-br from-tidal-bg via-tidal-secondary to-tidal-bg">
      <div className="text-center p-12 bg-tidal-secondary/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-tidal-secondary max-w-md">
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="w-12 h-12 bg-white text-black font-extrabold flex items-center justify-center rounded-md text-2xl">
            T
          </div>
          <h1 className="text-4xl font-bold tracking-tight">TIDE VIBE</h1>
        </div>

        {!deviceCode && !isPolling && (
          <>
            <p className="text-tidal-muted mb-8 text-lg">
              Connect your Tidal account to start streaming
            </p>
            <button
              onClick={handleStartAuth}
              className="px-8 py-4 bg-tidal-highlight text-black font-bold rounded-full hover:scale-105 transition-transform text-lg shadow-xl"
            >
              Login with Tidal
            </button>
          </>
        )}

        {deviceCode && (
          <div className="space-y-6">
            <div>
              <p className="text-tidal-muted mb-4">Enter this code on Tidal:</p>
              <div className="text-5xl font-mono font-bold tracking-widest text-tidal-highlight bg-black/30 py-6 px-8 rounded-lg">
                {userCode}
              </div>
            </div>

            <button
              onClick={openVerificationUrl}
              className="w-full px-6 py-3 bg-white text-black font-bold rounded-full hover:bg-tidal-highlight transition-colors"
            >
              Open Tidal Login
            </button>

            <p className="text-xs text-tidal-muted">
              Or go to: <span className="text-white">link.tidal.com</span>
            </p>

            {isPolling && (
              <div className="flex items-center justify-center gap-3 text-tidal-muted mt-6">
                <Loader2 className="animate-spin" size={20} />
                <span>Waiting for authentication...</span>
              </div>
            )}
          </div>
        )}

        {status && !error && (
          <div className="mt-4 text-sm text-tidal-muted">{status}</div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">
            {error}
            <button
              onClick={() => {
                setError(null);
                setDeviceCode(null);
                setUserCode(null);
                setStatus("");
              }}
              className="mt-2 block w-full text-center underline"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
