import './styles/style.css'
import { initStore, loadFromStorage, loadBoatsFromSupabase } from './state/store.js'
import { initRouter, navigate } from './ui/router.js'
import { renderApp } from './ui/render.js'
import { initDriftyDebug } from './debug/supabaseDebug.js'

async function start(){
  initDriftyDebug()
  initStore()
  loadFromStorage()
  try {
    await loadBoatsFromSupabase()
  } catch(err){
    console.error('[supabase] startup boats error', err)
  }
  initRouter(() => renderApp())
  navigate('login')
}

start()
