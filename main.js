// main.js
const { app, BrowserWindow, globalShortcut, session, systemPreferences } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

let mainWindow;
const isDev = process.argv.includes('--dev');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: isDev ? 1200 : 1920,
    height: isDev ? 800 : 1080,
    fullscreen: !isDev,
    kiosk: !isDev,
    frame: isDev,
    backgroundColor: '#1a1a1a',
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,                  // para que el preload (si lo añades) tenga require()
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
      autoplayPolicy: 'no-user-gesture-required',
      // preload: path.join(__dirname, 'preload.js') // si lo necesitas más adelante
    }
  });

  // Logs de carga
  mainWindow.webContents.on('did-start-loading', () => {
    console.log('Iniciando carga de index.html...');
  });
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Carga completada - mostrando ventana');
    mainWindow.show();
  });
  mainWindow.webContents.on('did-fail-load', (_e, code, desc) => {
    console.error('Error en carga:', code, desc);
  });
  mainWindow.webContents.on('console-message', (_e, _lvl, msg) => {
    console.log(`[RENDERER] ${msg}`);
  });
  mainWindow.webContents.on('crashed', () => {
    console.error('La ventana se ha colgado');
    app.quit();
  });

  mainWindow.loadFile('index.html').catch(console.error);

  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
    globalShortcut.register('CommandOrControl+Q', () => app.quit());
    globalShortcut.register('F12', () => mainWindow.webContents.toggleDevTools());
  }

  mainWindow.on('closed', () => { mainWindow = null; });
}

function setupSessionHandlers(ses) {
  // Permisos getUserMedia (p5.createCapture usa "media")
  ses.setPermissionRequestHandler((_wc, permission, callback) => {
    console.log(`Permiso solicitado: ${permission}`);
    if (['media', 'camera', 'microphone'].includes(permission)) return callback(true);
    callback(false);
  });

  ses.setPermissionCheckHandler((_wc, permission) => {
    return ['media', 'camera', 'microphone'].includes(permission);
  });

  // Interceptor transparente para audio en /music/*
  ses.webRequest.onBeforeRequest(
    { urls: ['file://*/*', 'http://*/*', 'https://*/*'] },
    (details, callback) => {
      try {
        const u = new URL(details.url);
        const isAudioPath = /(^|\/)music\/.+\.(mp3|ogg|wav|m4a|aac)$/i.test(u.pathname);
        if (!isAudioPath) return callback({});

        const filename = decodeURIComponent(u.pathname.split('/').pop() || '');
        const baseDir = app.isPackaged
          ? path.join(process.resourcesPath, 'music') // prod
          : path.join(__dirname, 'music');            // dev (ajusta si tu carpeta music está en otro sitio)
        const targetPath = path.join(baseDir, filename);
        return callback({ redirectURL: pathToFileURL(targetPath).toString() });
      } catch {
        return callback({});
      }
    }
  );
}

// ==== Arranque correcto (nada de session.defaultSession antes del ready) ====
app.whenReady().then(async () => {
  if (process.platform === 'darwin') {
    try { await systemPreferences.askForMediaAccess('camera'); } catch (e) { console.error(e); }
  }

  const ses = session.defaultSession;  // <- AHORA sí: ya estamos en ready
  setupSessionHandlers(ses);
  createWindow();
});

app.on('window-all-closed', () => {
  globalShortcut.unregisterAll();
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

process.on('SIGINT', () => app.quit());
process.on('SIGTERM', () => app.quit());
