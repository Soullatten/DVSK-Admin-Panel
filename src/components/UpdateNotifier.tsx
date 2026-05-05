import { useEffect, useRef } from "react";
import toast from "react-hot-toast";

interface DvskAppBridge {
  onMainEvent?: (channel: string, callback: (...args: unknown[]) => void) => () => void;
  checkForUpdates?: () => Promise<unknown>;
  quitAndInstallUpdate?: () => Promise<void>;
}

declare global {
  interface Window {
    dvskApp?: DvskAppBridge;
  }
}

/**
 * Mounted once at the top of the React tree. Listens to auto-update events from
 * the Electron main process (via preload bridge) and shows toasts so the user
 * knows when an update is downloading and when it's ready to install.
 *
 * In dev mode (running in browser via `npm run dev`) the dvskApp bridge isn't
 * present and this component is a no-op.
 */
export default function UpdateNotifier() {
  const downloadingToastId = useRef<string | null>(null);

  useEffect(() => {
    const bridge = window.dvskApp;
    if (!bridge?.onMainEvent) return;

    const unsubscribers: Array<() => void> = [];

    unsubscribers.push(
      bridge.onMainEvent("app:update-available", (...args: unknown[]) => {
        const info = args[0] as { version?: string } | undefined;
        const id = toast.loading(
          info?.version
            ? `Update v${info.version} found — downloading…`
            : `Update found — downloading…`,
          { duration: Infinity }
        );
        downloadingToastId.current = id;
      })
    );

    unsubscribers.push(
      bridge.onMainEvent("app:update-progress", (...args: unknown[]) => {
        const info = args[0] as { percent?: number } | undefined;
        const pct = Math.round(info?.percent ?? 0);
        if (downloadingToastId.current) {
          toast.loading(`Downloading update — ${pct}%`, {
            id: downloadingToastId.current,
            duration: Infinity,
          });
        }
      })
    );

    unsubscribers.push(
      bridge.onMainEvent("app:update-ready", (...args: unknown[]) => {
        const info = args[0] as { version?: string } | undefined;
        if (downloadingToastId.current) {
          toast.dismiss(downloadingToastId.current);
          downloadingToastId.current = null;
        }
        toast.success(
          (t) => (
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <span className="font-semibold">
                  Update {info?.version ? `v${info.version}` : ""} ready
                </span>
                <span className="text-[11px] text-[#aaa]">Click to restart and install</span>
              </div>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  bridge.quitAndInstallUpdate?.();
                }}
                className="bg-purple-600 hover:bg-purple-500 text-white text-[12px] font-bold px-3 py-1.5 rounded-lg transition-colors"
              >
                Restart
              </button>
            </div>
          ),
          { duration: Infinity }
        );
      })
    );

    unsubscribers.push(
      bridge.onMainEvent("app:update-error", (...args: unknown[]) => {
        const info = args[0] as { message?: string } | undefined;
        if (downloadingToastId.current) {
          toast.dismiss(downloadingToastId.current);
          downloadingToastId.current = null;
        }
        // Don't spam users with error toasts on every check — only log
        console.warn("[UpdateNotifier] update error:", info?.message);
      })
    );

    return () => {
      unsubscribers.forEach((u) => u());
      if (downloadingToastId.current) {
        toast.dismiss(downloadingToastId.current);
      }
    };
  }, []);

  return null;
}
