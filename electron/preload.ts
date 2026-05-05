import { contextBridge, ipcRenderer } from 'electron';

// Allowed event channels we forward from main → renderer
const ALLOWED_EVENT_CHANNELS = [
  'app:update-checking',
  'app:update-available',
  'app:update-none',
  'app:update-progress',
  'app:update-ready',
  'app:update-error',
  'app:notification',
] as const;

contextBridge.exposeInMainWorld('dvskApp', {
  platform: process.platform,
  versions: {
    chrome: process.versions.chrome,
    electron: process.versions.electron,
    node: process.versions.node,
  },

  // Subscribe to a main-process event. Returns an unsubscribe function.
  onMainEvent: (channel: string, callback: (...args: unknown[]) => void) => {
    if (!ALLOWED_EVENT_CHANNELS.includes(channel as (typeof ALLOWED_EVENT_CHANNELS)[number])) {
      return () => {};
    }
    const handler = (_evt: Electron.IpcRendererEvent, ...args: unknown[]) =>
      callback(...args);
    ipcRenderer.on(channel, handler);
    return () => ipcRenderer.removeListener(channel, handler);
  },

  // Auto-update controls
  checkForUpdates: () => ipcRenderer.invoke('app:check-for-updates'),
  quitAndInstallUpdate: () => ipcRenderer.invoke('app:quit-and-install'),
});
