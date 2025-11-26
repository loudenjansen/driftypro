import { STORE } from '../state/store.js'

let panel
let isVisible = false

function ensurePanel(){
  if (panel) return panel
  panel = document.createElement('div')
  panel.id = 'drifty-debug-panel'
  panel.style.position = 'fixed'
  panel.style.bottom = '12px'
  panel.style.right = '12px'
  panel.style.background = 'rgba(0,0,0,0.85)'
  panel.style.color = '#39ff14'
  panel.style.fontFamily = 'ui-monospace, SFMono-Regular, SFMono, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
  panel.style.fontSize = '12px'
  panel.style.border = '1px solid rgba(57,255,20,0.4)'
  panel.style.borderTopLeftRadius = '10px'
  panel.style.borderTopRightRadius = '10px'
  panel.style.borderBottomLeftRadius = '10px'
  panel.style.borderBottomRightRadius = '4px'
  panel.style.padding = '10px'
  panel.style.zIndex = '9999'
  panel.style.maxHeight = '60vh'
  panel.style.overflowY = 'auto'
  panel.style.boxShadow = '0 10px 25px rgba(0,0,0,0.45)'
  panel.style.display = 'none'

  const close = document.createElement('button')
  close.textContent = '×'
  close.style.position = 'absolute'
  close.style.top = '4px'
  close.style.right = '6px'
  close.style.background = 'transparent'
  close.style.border = 'none'
  close.style.color = '#39ff14'
  close.style.cursor = 'pointer'
  close.style.fontSize = '14px'
  close.onclick = () => toggleVisibility(false)
  panel.appendChild(close)

  const content = document.createElement('pre')
  content.id = 'drifty-debug-content'
  content.style.margin = '0'
  content.style.whiteSpace = 'pre-wrap'
  content.style.wordBreak = 'break-word'
  panel.appendChild(content)

  document.body.appendChild(panel)
  return panel
}

function toggleVisibility(force){
  ensurePanel()
  if (typeof force === 'boolean'){
    isVisible = force
  } else {
    isVisible = !isVisible
  }
  panel.style.display = isVisible ? 'block' : 'none'
  if (isVisible) renderDebugSnapshot()
}

export function renderDebugSnapshot(){
  ensurePanel()
  const content = panel.querySelector('#drifty-debug-content')
  if (!content) return
  const now = new Date()
  const boats = Array.isArray(STORE.boats) ? STORE.boats : []
  const reservations = Array.isArray(STORE.reservations) ? STORE.reservations : []
  const snapshot = {
    time: now.toLocaleString(),
    currentUser: STORE.currentUser || null,
    boatsCount: boats.length,
    reservationsCount: reservations.length,
    boats: boats.slice(0,3),
    reservations: reservations.slice(0,3),
  }
  content.textContent = JSON.stringify(snapshot, null, 2)
}

export function logSupabaseEvent(label, payload){
  try {
    console.log('[supabase]', label, payload)
    ensurePanel()
    const content = panel.querySelector('#drifty-debug-content')
    if (content){
      const now = new Date().toISOString()
      const existing = content.textContent || ''
      const logLine = `\n${now} :: ${label} :: ${JSON.stringify(payload || {})}`
      content.textContent = (existing + logLine).trim().slice(-5000)
    }
  } catch(err){
    console.error('[supabase] debug log error', err)
  }
}

export function initDriftyDebug(){
  ensurePanel()
  window.DRIFTY_DEBUG = {
    snapshot: renderDebugSnapshot,
    logSupabase: logSupabaseEvent,
  }
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && (e.key === 'd' || e.key === 'D')){
      e.preventDefault()
      toggleVisibility()
    }
  })
}
