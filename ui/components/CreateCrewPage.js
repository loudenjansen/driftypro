import { STORE } from '../../state/store.js'
import { navigate } from '../router.js'
import { createCrew } from '../../supabase/api.js'

async function handleCrewCreationSubmit(event, { statusEl, submitBtn } = {}){
  event?.preventDefault?.()
  if (!STORE.crewCreation || typeof STORE.crewCreation !== 'object') {
    STORE.crewCreation = { nameInput: '', loading: false }
  }
  const crewName = (STORE.crewCreation.nameInput || '').trim()
  if (!crewName){
    if (statusEl) statusEl.textContent = 'Vul een crewnaam in om te starten.'
    return
  }

  STORE.crewCreation.loading = true
  if (submitBtn){
    submitBtn.disabled = true
    submitBtn.textContent = 'Bezig...'
  }
  if (statusEl) statusEl.textContent = ''

  try {
    const created = await createCrew(crewName)
    const newCrewId = created?.id || created?.crew_id || created?.crewId
    if (statusEl) statusEl.textContent = 'Crew succesvol aangemaakt.'
    alert('Crew succesvol aangemaakt!')
    if (newCrewId){
      navigate(`/crew/${newCrewId}`)
    } else {
      navigate('/crew')
    }
    return created
  } catch(err){
    const msg = err?.message || 'Er ging iets mis bij het aanmaken van je crew.'
    if (statusEl) statusEl.textContent = msg
    alert(msg)
  } finally {
    STORE.crewCreation.loading = false
    if (submitBtn){
      submitBtn.disabled = false
      submitBtn.textContent = 'Maak crew aan'
    }
  }
}

export function renderCreateCrewPage(){
  const page = document.createElement('div')
  page.className = 'screen active'
  page.innerHTML = `
    <div class="hero fade-card">
      <div class="row" style="justify-content:space-between; align-items:flex-start">
        <div>
          <div class="pill">Crew aanmaken</div>
          <h1>Start een nieuwe crew</h1>
          <p class="muted">Geef je crew een naam en nodig je vrienden uit om samen te varen.</p>
        </div>
        <button class="ghost small" id="back">← Terug</button>
      </div>
    </div>
    <form id="crew-form" class="card fade-card" style="margin-top:12px">
      <label for="crew-name">Crewnaam</label>
      <input id="crew-name" placeholder="Bijv. Drifty Legends" />
      <div class="row" style="justify-content:space-between; align-items:center; gap:10px; flex-wrap:wrap; margin-top:10px">
        <div class="muted" id="crew-status"></div>
        <button type="submit" class="small" id="crew-submit">Maak crew aan</button>
      </div>
    </form>
  `

  const form = page.querySelector('#crew-form')
  const input = page.querySelector('#crew-name')
  const statusEl = page.querySelector('#crew-status')
  const submitBtn = page.querySelector('#crew-submit')

  if (page.querySelector('#back')) page.querySelector('#back').onclick = () => navigate('home')

  if (input){
    input.value = STORE.crewCreation?.nameInput || ''
    input.oninput = (e) => {
      STORE.crewCreation.nameInput = e.target.value
    }
  }

  if (form){
    form.onsubmit = (e) => handleCrewCreationSubmit(e, { statusEl, submitBtn })
  }

  return page
}

export { handleCrewCreationSubmit }
