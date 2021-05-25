import * as fs from 'fs'
import * as cp from 'child_process'
import * as p from 'path'

const desktop_pathes = [
  `${process.env.HOME}/.local/share/applications`,
  '/usr/local/share/applications',
  '/usr/share/applications'
]

let theme_icon_path = cp.execSync(`gsettings get org.gnome.desktop.interface icon-theme`).toString('utf-8').trim().slice(1, -1)
let icon_paths = [
  `${process.env.HOME}/.icons`,
  `${process.env.HOME}/.local/share/icons`,
  `/usr/local/share/icons/${theme_icon_path}`,
  `/usr/share/icons/${theme_icon_path}`,
]
icon_paths = [...icon_paths, ...icon_paths.map(i => `${i}/hicolor`)]

type DesktopAction = {
  name: string
  exec: string
}

// check $LANG
// NotShowIn && OnlyShowIn (';' sep) vs process.env.XDG_CURRENT_DESKTOP (':' sep)
// Actions
// StartupNotify for i3
// StartupWMClass, useful to tell which window is mapped to what...

type DesktopFile = {
  name: string
  icon: string
  exec: string
  categories?: string[]
  keywords?: string[]
  path?: string
  actions: {}[]
}
function handle_desktop(path: string) {
  let lines = fs.readFileSync(path, 'utf-8').split(/\n/g)

  for (let l of lines) {
    let t = l.trim()
    if (t[0] === '#' || !t) continue

    console.log(t)
  }
  // console.log(lines)
}


function handle_desktop_dir(path: string) {
  let dir = fs.readdirSync(path)
  for (let f of dir) {
    let full_path = p.join(path, f)
    let st = fs.statSync(full_path)
    if (!st.isFile() || !f.endsWith('.desktop')) continue
    handle_desktop(full_path)
  }
}

for (let d of desktop_pathes) {
  try {
    handle_desktop_dir(d)
  } catch (e) { }
}