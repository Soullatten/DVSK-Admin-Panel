import { useEffect, useRef, useState } from "react";
import type { ComponentType } from "react";
import { Music2, Loader2, RefreshCw, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

// Electron's <webview> tag isn't a standard React element. Instead of fighting
// React's JSX type system, we cast the literal tag name into a component that
// accepts the Electron-specific attributes we need. It only renders inside the
// packaged desktop app (in `npm run dev`, the fallback notice shows instead).
type WebviewProps = {
  ref?: (el: HTMLElement | null) => void;
  src?: string;
  partition?: string;
  allowpopups?: string;
  useragent?: string;
  style?: React.CSSProperties;
};
const Webview = "webview" as unknown as ComponentType<WebviewProps>;

const SPOTIFY_URL = "https://open.spotify.com";

export default function Music() {
  const webviewRef = useRef<HTMLElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    setIsElectron(Boolean((window as unknown as { dvskApp?: unknown }).dvskApp));
  }, []);

  useEffect(() => {
    const wv = webviewRef.current;
    if (!wv) return;
    const onStart = () => setLoading(true);
    const onStop = () => setLoading(false);
    // Spotify's "Log in" flow opens a popup window for OAuth. By default Electron
    // lets that popup escape into the user's real browser, which means the
    // session cookie lands there instead of inside our embedded player. Catch
    // the popup and load it inside the same webview so login lives in our
    // persist:spotify partition.
    const wvAny = wv as unknown as {
      loadURL?: (url: string) => void;
    };
    const onNewWindow = (e: Event & { url?: string; preventDefault?: () => void }) => {
      e.preventDefault?.();
      if (e.url && wvAny.loadURL) wvAny.loadURL(e.url);
    };
    wv.addEventListener("did-start-loading", onStart);
    wv.addEventListener("did-stop-loading", onStop);
    wv.addEventListener("new-window", onNewWindow as EventListener);
    return () => {
      wv.removeEventListener("did-start-loading", onStart);
      wv.removeEventListener("did-stop-loading", onStop);
      wv.removeEventListener("new-window", onNewWindow as EventListener);
    };
  }, [isElectron]);

  const handleReload = () => {
    const wv = webviewRef.current as unknown as { reload?: () => void } | null;
    wv?.reload?.();
  };

  const handleOpenExternal = () => {
    window.open(SPOTIFY_URL, "_blank");
  };

  return (
    <div className="h-[calc(100vh-60px)] bg-[#050505] text-white flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-[#0a0a0a]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
            <Music2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-[18px] font-bold tracking-tight">Music</h1>
            <p className="text-[11px] tracking-[0.25em] text-[#666] uppercase mt-0.5">
              Spotify · log in once and listen
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleReload}
            title="Reload Spotify"
            className="window-no-drag p-2 rounded-xl text-[#888] hover:text-white hover:bg-white/5 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleOpenExternal}
            title="Open in browser"
            className="window-no-drag p-2 rounded-xl text-[#888] hover:text-white hover:bg-white/5 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 relative overflow-hidden bg-[#000]">
        {!isElectron ? (
          // In dev (browser tab) — Spotify blocks iframes, so show a friendly notice
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center max-w-md px-6">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <Music2 className="w-6 h-6 text-emerald-400" />
              </div>
              <h2 className="text-[18px] font-bold text-white mb-2">Music is desktop-only</h2>
              <p className="text-[13px] text-[#888] leading-relaxed">
                Spotify can't be embedded inside a browser tab. Open the installed
                DVSK Admin desktop app and the full Spotify player will live here —
                full search, playlists, your saved library, everything.
              </p>
              <button
                onClick={handleOpenExternal}
                className="mt-6 inline-flex items-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-400 px-4 py-2 rounded-xl text-[13px] font-semibold transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open Spotify in browser
              </button>
            </div>
          </div>
        ) : (
          <>
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#000] pointer-events-none">
                <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
              </div>
            )}
            <Webview
              ref={(el) => {
                webviewRef.current = el;
              }}
              src={SPOTIFY_URL}
              partition="persist:spotify"
              allowpopups="true"
              useragent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"
              style={{ width: "100%", height: "100%", border: "none" }}
            />
          </>
        )}
      </div>
    </div>
  );
}
