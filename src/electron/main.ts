import * as path from  'path'
import * as url from 'url'
import { app, BrowserWindow, protocol, session } from 'electron'
import { isDev } from 'electron-util/main'
import { is } from 'electron-util'

let win: BrowserWindow | null = null

const dirname = path.dirname(new URL(import.meta.url).pathname)

async function createWindow() {
  const ses = session.fromPartition("persist:main")

  win = new BrowserWindow({
    width: 800,
    height: 820,
    minHeight: 480,
    minWidth: 640,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      session: ses,
    },
    show: false,
  })

  if (isDev) {
    win.loadURL('http://localhost:9080')
  } else {
    win.loadURL(
      url.format({
        pathname: path.join(dirname, 'index.html'),
        protocol: 'file',
        slashes: true,
      }),
    )
  }

  win.on('closed', () => {
    win = null
  })

  win.webContents.on('devtools-opened', () => {
    win!.focus()
  })

  win.on('ready-to-show', () => {
    win!.show()
    win!.focus()

    if (isDev) {
      win!.webContents.openDevTools({ mode: 'bottom' })
    }
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (!is.macos) {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null && app.isReady()) {
    createWindow()
  }
})
