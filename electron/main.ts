import { app, BrowserWindow, shell, Menu, ipcMain, session } from 'electron';
import { autoUpdater } from 'electron-updater';
import * as path from 'path';
import * as fs from 'fs';

// Electron sets app.isPackaged = true once it's running inside a real .exe.
// In development (npm run electron:dev) it's false, so we point at Vite's dev server.
const isDev = !app.isPackaged;

const VITE_DEV_SERVER_URL =
  process.env.VITE_DEV_SERVER_URL || 'http://localhost:5172';

// Resolve a Windows .ico icon if the user has dropped one at build/icon.ico.
// Falls back to no icon (Electron default) so dev never crashes from a missing file.
function resolveIcon(): string | undefined {
  const candidates = [
    path.join(__dirname, '..', 'build', 'icon.ico'),
    path.join(__dirname, '..', 'build', 'icon.png'),
  ];
  for (const c of candidates) {
    try {
      if (fs.existsSync(c)) return c;
    } catch {}
  }
  return undefined;
}

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    backgroundColor: '#0A0914',
    title: 'DVSK Admin',
    autoHideMenuBar: true,
    show: false,
    icon: resolveIcon(),
    // Hide the Windows native title bar entirely. Native min/max/close buttons
    // still get rendered via titleBarOverlay in the top-right corner, but they
    // adopt our dark theme so the window looks fully custom.
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#0A0914',
      symbolColor: '#ececec',
      height: 36,
    },
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false, // sandbox must be false for webview tags to work
      webviewTag: true, // enables <webview> tags so the Music page can host Spotify
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Show only when the renderer is ready — eliminates the "white flash" on startup.
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  if (isDev) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // file:// path to the built React app inside the packaged .exe
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  // Make Ctrl+Shift+I (and F12) toggle DevTools even though we hid the menu bar.
  mainWindow.webContents.on('before-input-event', (_event, input) => {
    const isToggle =
      (input.control && input.shift && input.key.toLowerCase() === 'i') ||
      input.key === 'F12';
    if (isToggle && input.type === 'keyDown') {
      mainWindow?.webContents.toggleDevTools();
    }
  });

  // Log any failures to load the renderer to the main process console
  mainWindow.webContents.on('did-fail-load', (_e, errorCode, errorDescription, validatedURL) => {
    console.error('[main] did-fail-load', { errorCode, errorDescription, validatedURL });
  });
  mainWindow.webContents.on('render-process-gone', (_e, details) => {
    console.error('[main] render-process-gone', details);
  });

  // External links open in the user's default browser, not inside the app
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // In production, hide the application menu (File/Edit/View bar at top).
  // Ctrl+Shift+I still works to open devtools when needed for debugging.
  if (!isDev) {
    Menu.setApplicationMenu(null);
  }
}

// Auto-update wiring. electron-updater talks to GitHub Releases (configured
// in package.json's build.publish section) and notifies the renderer of state
// changes so React can show a toast.
function setupAutoUpdater() {
  if (isDev) return; // never auto-update in dev mode
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  const send = (channel: string, payload?: unknown) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send(channel, payload);
    }
  };

  autoUpdater.on('checking-for-update', () => send('app:update-checking'));
  autoUpdater.on('update-available', (info) =>
    send('app:update-available', { version: info?.version })
  );
  autoUpdater.on('update-not-available', () => send('app:update-none'));
  autoUpdater.on('download-progress', (p) =>
    send('app:update-progress', { percent: p?.percent ?? 0 })
  );
  autoUpdater.on('update-downloaded', (info) =>
    send('app:update-ready', { version: info?.version })
  );
  autoUpdater.on('error', (err) =>
    send('app:update-error', { message: err?.message || String(err) })
  );

  // Renderer (React) can ask: "is there an update right now?" or "install it now"
  ipcMain.handle('app:check-for-updates', () =>
    autoUpdater.checkForUpdates().catch((e) => ({ error: String(e) }))
  );
  ipcMain.handle('app:quit-and-install', () => {
    autoUpdater.quitAndInstall();
  });

  // Auto-check shortly after launch, then once an hour while the app is open
  setTimeout(() => autoUpdater.checkForUpdatesAndNotify().catch(() => {}), 4000);
  setInterval(() => autoUpdater.checkForUpdatesAndNotify().catch(() => {}), 60 * 60 * 1000);
}

// Strip frame-blocking headers from Spotify (and other music providers) so
// the embedded webview on the Music page can load them. These headers normally
// prevent embedding into iframes — webview is allowed to bypass them, but we
// also strip them defensively for any nested iframe Spotify itself may use.
function setupHeaderBypass() {
  const blockedDomains = [
    'spotify.com',
    'scdn.co',
    'spotifycdn.com',
  ];
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const url = details.url || '';
    if (blockedDomains.some((d) => url.includes(d))) {
      const headers = { ...(details.responseHeaders || {}) };
      for (const key of Object.keys(headers)) {
        const lower = key.toLowerCase();
        if (lower === 'x-frame-options' || lower === 'content-security-policy') {
          delete headers[key];
        }
      }
      callback({ responseHeaders: headers });
      return;
    }
    callback({ responseHeaders: details.responseHeaders });
  });
}

app.whenReady().then(() => {
  setupHeaderBypass();
  createWindow();
  setupAutoUpdater();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Hard security: block any in-app navigation away from our own origin.
// If a clicked link tries to navigate the whole window somewhere else,
// we cancel and pop it open in the user's browser instead.
//
// IMPORTANT: This must NOT apply to <webview> contents. The Music page embeds
// Spotify via webview, and Spotify legitimately navigates between
// open.spotify.com → accounts.spotify.com → back during login. Treating those
// as "away from our origin" sends users to their real browser and breaks the
// embedded login flow entirely.
app.on('web-contents-created', (_event, contents) => {
  if (contents.getType() === 'webview') {
    // Keep popups (OAuth, Continue with Google/Facebook, target=_blank links)
    // inside the same webview so login cookies land in the embedded session.
    contents.setWindowOpenHandler(({ url }) => {
      contents.loadURL(url).catch(() => {});
      return { action: 'deny' };
    });
    return;
  }

  contents.on('will-navigate', (event, navigationUrl) => {
    const allowedPrefix = isDev ? VITE_DEV_SERVER_URL : 'file://';
    if (!navigationUrl.startsWith(allowedPrefix)) {
      event.preventDefault();
      shell.openExternal(navigationUrl);
    }
  });
});
