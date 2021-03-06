import './immerize'

import { I } from 'elt-fa'
import 'elt-fa/calendar-alt-regular'
import 'elt-fa/battery-three-quarters-solid'
import 'elt-fa/microchip-solid'
import 'elt-fa/thermometer-full-solid'
import 'elt-fa/arrow-down-solid'
import 'elt-fa/arrow-up-solid'

import { $click, If, o, Repeat, setup_mutation_observer } from 'elt'

import { i3 } from './i3'

let pct = Intl.NumberFormat('us', {style: 'percent'})
let kb = Intl.NumberFormat('us', { style: 'unit', unit: 'kilobyte', maximumFractionDigits: 1 })

const o_stats = o({} as {
  battery?: { percent: number, timeRemaining: number | null },
  cpuTemperature?: { main: number },
  cpuCurrentSpeed?: { avg: number },
  networkStats?: {
    iface: string,
    tx_bytes: number,
    rx_bytes: number,
    tx_sec: number,
    rx_sec: number,
  }[]
})

window.api.receive('stats', stats => {
  o_stats.set(stats)
  // console.log(stats)
})

window.api.receive('i3', (kind, payload) => {
  i3.handleI3Msg(kind, payload)
  // console.log(kind, payload)
})
// window.api.send('i3', 'tree')

// Things to implement
// input module
// input with fuzzy choices
// input with fuzzy choices and new possibility

//
// focus window <n> on visible workspace starting from leftmost to rightmost
// go to next workspace on same screen
// rename current workspace
// rename current group
// move window to workspace <n>
// invert workspaces ?

// workspaces not corresponding to a regular name will have

/**
  Stuff that I have to keep in mind, before even having a status
  - Workspace list *on current screen !!!*
     which means we want the outputs
     which also means that a given bar needs to know where it's at.
  - Active workspace
  ( - Current window ? )

  - Show the time
**/

/////////////////////////////////////////////////////////////////////////////////
////////////////////////// i3 functions /////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////


;(window as any).stats = function (st: any) {
  console.log(st)
}


// function i3(cmd: string) {
//   return window.__rpc('i3', cmd)
// }
const dt = Intl.DateTimeFormat('fr', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
})
const o_time = o(new Date)
setInterval(() => {
  o_time.set(new Date)
}, 1000)

function init() {
  setup_mutation_observer(document.body)

  document.body.appendChild(<div class='bar'>
    {/* {$observe(i3.o_display_groups_show, s => console.log('show', s))} */}
    {Repeat(o.join(i3.o_display_groups_show, i3.o_current_group).tf(([groups, cur]) => groups.filter(g => g.name === cur)), o_group => <div class='workspace-list'>
      <div class='group-name'>
        {$click(_ => {
          i3.queryOtherGroup().then(g => i3.switchGroup(g))
        })}
        {o_group.p('name')}
      </div>
      {Repeat(o_group.p('outputs'), o_output => <>
        {Repeat(o_output.p('workspaces'), o_work => <div
            class={['workspace', {urgent: o_work.p('urgent'), visible: o_work.p('visible')}]}
          >
            {$click(async _ => {
              try {
                // console.log(`workspace "${o_work.get().name}"`)
                i3.cmd(`workspace ${o_work.get().name}`)
              } catch (e) {
                console.error(e)
              }
              _.stopPropagation()

            })}
            {o_work.p('label')}
        </div>)}
      </>)}
    </div>)}
    {$click(_ => {
      // o_current.set('POUET');
      // query().then(r => console.log('result: ', r))
    })}
    <div class="windows">
      {Repeat(i3.o_current_windows, (o_vis, idx) => <div
        class={['window', {focused: o_vis.p('focused'), urgent: o_vis.p('urgent')}]}
        title={o_vis.tf(v => v.name)}
      >
        {$click(_ => {
          i3.cmd(`[con_id=${o_vis.get().id}] focus`)
        })}
        <span class='number'>{idx+1}: </span>
        <span class='class'>{o_vis.tf(v => v.window_properties?.instance)}</span>
        <span class='title'>{o_vis.tf(v => v.name)}</span>
      </div>)}
    </div>
      {/* ?? {o_current_window.tf(w => {
        // console.log('current : ', w)
        // __rpc('???', w?.name)
        return w?.name ?? '-'
      })} ?? */}
    {/* <img src="file:///home/chris/swapp/apps/1811-ipsen-engagements/__dist__/client/android-icon-144x144.png" width="32" height="32"></img> */}
    {If(o_stats.p('networkStats'), o_networks => <div class='widget stat'>
      {Repeat(o_networks, o_net => <span>{o_net.p('iface')} {I('arrow-down')} {o_net.tf(n => kb.format(n.rx_sec/1024))} {I('arrow-up')} {o_net.tf(n => kb.format(n.tx_sec/1024))}</span>)}
    </div>)}
    {If(o_stats.p('cpuTemperature'), o_temp => <div class='widget stat'>
      {I('thermometer-full')}
      {' '}
      {o_temp.p('main')}??
    </div>)}
    {If(o_stats.p('cpuCurrentSpeed'), o_speed => <div class='widget stat'>
      {I('microchip')}
      {' '}
      {o_speed.p('avg')}
    </div>)}
    {If(o_stats.p('battery'), o_bat => <div class='widget stat'>
      {I('battery-three-quarters')}
      {' '}
      {o_bat.tf(b => pct.format(b.percent/100))}
    </div>)}
    <div class='widget date'>
      {I('calendar-alt-regular')}
      {' '}
      {o_time.tf(t => dt.format(t))}</div>
    {i3}
  </div>)
}


// window.__rpc('show')
// setInterval(() => {
//   window.__rpc('pouet')
// }, 1000)
i3.upd()
requestAnimationFrame(() => {
  init()
})