#!/usr/bin/env electron
import { app, BrowserWindow, ipcMain } from 'electron'
import * as path from 'path'
import * as si from 'systeminformation'


let win!: BrowserWindow
// console.log(app, BrowserWindow, require('electron'))
ipcMain.on('i3', (data, msg) => {
  // console.log(msg)
  if (msg.kind === 'tree') {
    i3.tree((err: any, res: any) => {
      // console.log('replied')
      data.reply('i3', 'tree', res, err)
    })
  } else if (msg.kind === 'cmd') {
    // console.log()
    i3.command(msg.cmd, (err, res) => {
      // console.log(err, res)
      data.reply('i3', '')
    })
  }
})

function createWindow () {
  if (win) throw new Error('WHAT')

  win = new BrowserWindow({
    width: 1920,
    height: 32,
    y: 1080,
    transparent: true,
    frame: false,
    title: '3lectron',
    // backgroundColor: '#00ffffff',
    autoHideMenuBar: true,
    type: 'dock',
    show: false,
    webPreferences: {
      nativeWindowOpen: true,
      preload: path.join(__dirname, 'preload.js'),
    }
  })

  // si.baseboard
  si.observe({
    cpuTemperature: 'main',
    cpuCurrentSpeed: 'avg',
    battery: 'percent,timeRemaining',
    networkStats: 'iface,tx_bytes,rx_bytes,rx_sec,tx_sec',
  }, 5000, data => {
    // console.log(data)
    win?.webContents.send('stats', data)
  })

  win.on('ready-to-show', () => {
    win.show()
    if (process.env.DEBUG)
      win?.webContents.openDevTools({mode: 'detach'})
  })

  win.webContents.setWindowOpenHandler(details => {
    return {
      action: 'allow',
      overrideBrowserWindowOptions: {
        type: 'dialog',
        width: 800,
        height: 600,
      }
    }
  })

  win.setBounds({
    width: 1920,
    height: 32,
    y: 1080,
    x: 0,
  })

  win.loadFile(path.join(__dirname, '../ui/index.html'))
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

let i3: any = null
function makeI3Client() {
  i3 = require('i3').createClient()

  i3.on('error', (er: any) => {
    console.error(er)
  })

  i3.on('connect', (c: any) => {
    app.whenReady().then(() => {
      createWindow()
      // win?.webContents.send('i3', 'connect', c)
    })
    // main_display.setDock()
    // we want to give the connection the time to connect to i3 before gtk takes over the thread.
  })
  i3.on('output', (o: any) => {
    win?.webContents.send('i3', 'output', o)
    // main_display.msg('output', o)
  })
  i3.on('shutdown', (d: any) => {
    console.log('shutdown', d)
    app.quit()
    // main_display.msg('shutdown', d)
    process.exit(0)
  })
  i3.on('workspace', (wk: any) => {
    win?.webContents.send('i3', 'workspace', wk)
    // console.log(wk)
    // main_display.msg('workspace', wk)
  })
  i3.on('window', (wk:any) => {
    win?.webContents.send('i3', 'window', wk)
    // console.log(wk)
    // main_display.msg('window', wk)
  })
  i3.on('binding', (b: any) => {
    if (b.binding.command.indexOf('nop i3c') !== 0) return;
    win?.webContents.send('i3', 'binding', b)
    // main_display.msg('binding', b)
  })
  i3.on('barconfig_update', (b: any) => {
    win?.webContents.send('i3', 'barconfig_update', b)
    // main_display.msg('barconfig_update', b)
  })
}
makeI3Client()