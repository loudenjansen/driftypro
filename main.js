// drifty/ui/main.js (Definitieve Versie)

import './styles/style.css'
import { initStore, loadFromStorage, loadBoatsFromSupabase } from './state/store.js'
import { initRouter, navigate } from './ui/router.js'
import { renderApp } from './ui/render.js'

// VERWIJDERD: import { initDriftyDebug } from './debug/supabaseDebug.js'

async function start(){
  // VERWIJDERD: initDriftyDebug()
  initStore()
  loadFromStorage()
  try {
    // Laad de boten van Supabase (gebruikt nu de nieuwe client in supabase/api.js)
    await loadBoatsFromSupabase()
  } catch(err){
    console.error('[supabase] startup boats error', err)
  }
  initRouter(() => renderApp())
  navigate('login')
}

start()
