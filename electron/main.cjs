// Ventana de escritorio para Leen-Señas (Electron). Sirve la carpeta "dist" en un servidor local
// interno para que la cámara, MediaPipe (wasm) y los videos de YouTube funcionen igual que en el navegador.
const { app, BrowserWindow, session, shell } = require('electron')
const http = require('http'), fs = require('fs'), path = require('path')

const DIST = path.join(__dirname, '..', 'dist')
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.wasm': 'application/wasm', '.task': 'application/octet-stream', '.ico': 'image/x-icon' }

function servidor() {
  return new Promise(resolve => {
    const s = http.createServer((req, res) => {
      let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html'
      const f = path.normalize(path.join(DIST, p))
      if (!f.startsWith(DIST)) { res.writeHead(403); return res.end() }
      fs.readFile(f, (err, data) => {
        if (err) { res.writeHead(404); return res.end('No encontrado') }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(f).toLowerCase()] || 'application/octet-stream' }); res.end(data)
      })
    })
    s.listen(0, '127.0.0.1', () => resolve(s.address().port))
  })
}

app.whenReady().then(async () => {
  const ok = ['media', 'fullscreen']               // solo cámara y pantalla completa
  session.defaultSession.setPermissionRequestHandler((_wc, perm, cb) => cb(ok.includes(perm)))
  session.defaultSession.setPermissionCheckHandler((_wc, perm) => ok.includes(perm))
  const port = await servidor()
  const win = new BrowserWindow({ width: 1200, height: 800, minWidth: 360, autoHideMenuBar: true, title: 'Leen-Señas' })
  win.loadURL(`http://127.0.0.1:${port}/`)
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' } })
})
app.on('window-all-closed', () => app.quit())
