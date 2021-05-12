const { contextBridge, ipcRenderer } = require('electron')

function read_desktop_entry(contents: string) {

}

// Get the icon path for an icon name
function get_icon_path(name: string) {

}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('fs', require('fs'))
contextBridge.exposeInMainWorld(
  "api", {
      send: (channel: string, data: any) => {
          // whitelist channels
          let validChannels = ["i3"];
          if (validChannels.includes(channel)) {
              ipcRenderer.send(channel, data);
          }
      },
      receive: (channel: string, func: any) => {
          let validChannels = ["i3", "stats"];
          if (validChannels.includes(channel)) {
              // Deliberately strip event as it includes `sender`
              ipcRenderer.on(channel, (event, ...args) => func(...args));
          }
      }
  }
);

// window.ipc = ipcRenderer
