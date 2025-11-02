// main.js - Aplicación Electron para proyecto Halloween
const { app, BrowserWindow, globalShortcut, Menu, session } = require('electron');
const path = require('path');

let mainWindow;
const isDev = process.argv.includes('--dev');

function createWindow() {
  console.log('Creando ventana de Halloween Kiosk...');
  
  // Configurar permisos antes de crear ventana
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    console.log(`Permiso solicitado: ${permission}`);
    // Permitir permisos multimedia
    if (['camera', 'microphone', 'media', 'mediaKeySystem', 'geolocation'].includes(permission)) {
      console.log(`Permiso de ${permission} concedido automáticamente`);
      callback(true);
    } else {
      callback(false);
    }
  });

  // Configurar políticas de contenido multimedia
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Permissions-Policy': ['camera=*, microphone=*, autoplay=*'],
        'Feature-Policy': ['camera *; microphone *; autoplay *']
      }
    });
  });

  try {
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
        sandbox: false,
        webSecurity: true,
        allowRunningInsecureContent: false,
        experimentalFeatures: false,
        autoplayPolicy: 'no-user-gesture-required',
        preload: path.join(__dirname, 'preload.js')
    }
    });

    // Eventos de carga de la ventana
    mainWindow.webContents.on('did-start-loading', () => {
      console.log('Iniciando carga de index.html...');
    });

    mainWindow.webContents.on('did-finish-load', () => {
      console.log('Carga completada - mostrando ventana');
      mainWindow.show();
    });

    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error('Error en carga:', errorCode, errorDescription);
    });

    // Mensajes de consola del renderer
    mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
      console.log(`[RENDERER] ${message}`);
    });

    // Permitir permisos de medios después de cargar
    mainWindow.webContents.on('did-finish-load', () => {
      // Configurar permisos de medios automáticamente
      mainWindow.webContents.session.setPermissionCheckHandler(() => {
        return true;
      });
    });

    // Cargar archivo con manejo de errores
    mainWindow.loadFile('index.html')
      .then(() => {
        console.log('index.html cargado correctamente');
      })
      .catch((error) => {
        console.error('Error cargando index.html:', error);
      });

    // Configuración para desarrollo
    if (isDev) {
      mainWindow.webContents.openDevTools();
      
      globalShortcut.register('CommandOrControl+Q', () => {
        app.quit();
      });
      
      globalShortcut.register('F12', () => {
        mainWindow.webContents.toggleDevTools();
      });
    }

    mainWindow.on('closed', () => {
      mainWindow = null;
    });

    mainWindow.webContents.on('crashed', () => {
      console.error('La ventana se ha colgado');
      app.quit();
    });

    // Configuración adicional para audio en Electron
    session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
      details.requestHeaders['User-Agent'] = 'p5js-halloween-electron';
      callback({ requestHeaders: details.requestHeaders });
    });

    //  Desactivar throttling de audio en background
    mainWindow.webContents.on('did-finish-load', () => {
      mainWindow.webContents.setAudioMuted(false);
      mainWindow.webContents.executeJavaScript(`
        console.log('Audio setup for Electron');
      `);
    });

  } catch (error) {
    console.error('Error creando ventana:', error);
    app.quit();
  }
}

app.whenReady().then(() => {
  createWindow();
});



app.on('window-all-closed', () => {
  globalShortcut.unregisterAll();
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

process.on('SIGINT', () => {
  app.quit();
});

process.on('SIGTERM', () => {
  app.quit();
});