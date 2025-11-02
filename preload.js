const { contextBridge } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

function audioUrl(name) {
  // En dev: carpeta local; en prod: dentro del bundle
  const base = process.resourcesPath && !__dirname.includes('electron')
    ? path.join(process.resourcesPath, 'music')      // prod (copiado con extraResources)
    : path.join(__dirname, 'music');                 // dev (ajústalo a tu estructura)

  const filePath = path.join(base, name);            // <-- path con espacios tal cual
  return pathToFileURL(filePath).href;               // <-- genera file:///… con %20 una sola vez
}

// opción extra: construir desde un path absoluto (como tu ruta de Dropbox)
function fromAbsolute(absPath) {
  return pathToFileURL(absPath).href;
}

contextBridge.exposeInMainWorld('audios', {
  url: (name) => audioUrl(name),
  fromPath: (absPath) => fromAbsolute(absPath)
});
