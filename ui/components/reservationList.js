import { STORE, save, generateShareCode } from '../../state/store.js'
import { hoursBetween, toISODateHour, timesOverlap } from '../../lib/utils.js'
import { navigate } from '../router.js'

function renderNav(container){
  const nav = document.createElement('div')
  nav.className = 'bottom-nav'
  const isAdmin = !!STORE.currentUser?.isAdmin
  nav.innerHTML = `
    <button data-nav="home">🏠 Home</button>
    <button data-nav="share">🤝 Delen</button>
    <button data-nav="social">📸 Social</button>
    <button data-nav="shop">🛒 Shop</button>
    <button data-nav="profile">👤 Profiel</button>
    <button data-nav="leader">🏆 Leaderboard</button>
    ${isAdmin ? '<button data-nav="admin">🛠️ Admin</button>' : ''}
  `
  nav.querySelectorAll('button').forEach(btn=>{
    if(btn.dataset.nav==='home') btn.classList.add('active')
    btn.onclick = () => navigate(btn.dataset.nav)
  })
  container.appendChild(nav)
}

export function renderBoat(){
  const b = STORE.boats.find(x=>x.id===STORE.currentBoatId)
  const page = document.createElement('div')
  page.className = 'screen active'
  page.innerHTML = `
    <div class="hero fade-card">
      <div class="row" style="justify-content:space-between; align-items:flex-start">
        <div>
          <div class="pill">Boot details</div>
          <h1 id="b-name">${b?.name||'Boot'}</h1>
          <div class="chip-row" style="margin:8px 0">
            <span class="pill ${b?.status==='available'?'green':''}" id="b-status">${b?.status||'—'}</span>
            <span class="pill ghost">🚦 Weer: ${STORE.weather.code}</span>
          </div>
          <p class="muted">Reserveer je uurslot en houd de crew in sync.</p>
        </div>
        <button class="ghost small" id="back">← Terug</button>
      </div>
      <div class="stat-grid">
        <div class="stat">
          <div class="label">Actieve slots</div>
          <div class="value">${STORE.reservations.filter(r=>r.boatId===STORE.currentBoatId).length}</div>
          <div class="muted">Alle geplande blokken.</div>
        </div>
        <div class="stat">
          <div class="label">Crew</div>
          <div class="value">${(STORE.currentUser?.name||'Nog niet') }</div>
          <div class="muted">Wordt toegevoegd bij deelname.</div>
        </div>
        <div class="stat">
          <div class="label">Weer-gate</div>
          <div class="value">${STORE.weather.code}</div>
          <div class="muted">Altijd bijwerken voor vertrek.</div>
        </div>
      </div>
    </div>

    <div class="layout-split">
      <div class="card fade-card">
        <h2>Reserveer uurslot</h2>
        <div class="muted">Plan een blok of sluit aan bij een bestaand slot.</div>
        <div class="row" style="align-items:flex-start; margin-top:10px">
          <div style="flex:1; min-width:200px">
            <label>Datum</label><input id="slot-date" type="date"/>
          </div>
          <div style="flex:1; min-width:140px">
            <label>Startuur</label><select id="slot-hour"></select>
          </div>
          <div style="flex:1; min-width:140px">
            <label>Duur (uren)</label><select id="slot-dur"></select>
          </div>
        </div>
        <div class="row" style="justify-content:flex-start; gap:12px; margin-top:10px">
          <button id="reserve">Reserveer (onder voorbehoud)</button>
          <button class="secondary" id="join-exact">Join exact slot</button>
        </div>
        <div class="msg" style="margin-top:10px">Betaal alleen bij activeren. Je crew wordt automatisch gekoppeld aan dit slot.</div>
      </div>

      <div class="card strong">
        <h2>Boot info</h2>
        <p class="muted">Controleer weersituatie en slotdetails voor je team.</p>
        <div class="list-stack" style="margin-top:6px">
          <div class="pill ghost">🚦 Gate: ${STORE.weather.code}</div>
          <div class="pill">⚓ Status: ${b?.status||'—'}</div>
          <div class="pill green">🌊 Crew ready</div>
        </div>
        <div class="divider"></div>
        <div class="ghost-tile">Tip: houd de vloot in de gaten en sluit aan bij slots van teammates.</div>
      </div>
    </div>

    <div class="section-title">📅 Uursloten</div>
    <div id="res-list" class="list-stack"></div>
  `

  page.querySelector('#back').onclick = () => navigate('home')

  const hourSel = page.querySelector('#slot-hour')
  for(let h=6; h<=22; h++){ const o=document.createElement('option'); o.value=h; o.textContent = String(h).padStart(2,'0')+':00'; hourSel.appendChild(o) }
  const durSel = page.querySelector('#slot-dur')
  for(let d=1; d<=8; d++){ const o=document.createElement('option'); o.value=d; o.textContent = d+' uur'; durSel.appendChild(o) }
  page.querySelector('#slot-date').value = (new Date()).toISOString().slice(0,10)

  page.querySelector('#reserve').onclick = () => reserveSlot(page)
  page.querySelector('#join-exact').onclick = () => joinExact(page)

  renderResList(page)
  renderNav(page)
  return page
}

function calcCost(res){
  const hrs = hoursBetween(res.start,res.end)
  res.total = +(1*hrs).toFixed(3) // accessoires later
}

function reserveSlot(page){
  const date = page.querySelector('#slot-date').value
  const hour = +page.querySelector('#slot-hour').value
  const dur  = +page.querySelector('#slot-dur').value
  if(!date) return alert('Kies een datum')
  const start = toISODateHour(date,hour), end = toISODateHour(date,hour+dur)
  const clash = STORE.reservations.some(r=> r.boatId===STORE.currentBoatId && timesOverlap(start,end,r.start,r.end))
  if(clash) return alert('Overlappende reservering op deze boot')
  let r = STORE.reservations.find(x=>x.boatId===STORE.currentBoatId && x.start===start && x.end===end)
  if(!r){
    r = { id:crypto.randomUUID?.()||start, boatId:STORE.currentBoatId, start, end, users:[], status:'pending' }
    calcCost(r)
    r.shareCode = generateShareCode()
    STORE.reservations.push(r)
  }
  const me = STORE.currentUser?.name
  if (me && !r.users.includes(me)) r.users.push(me)
  if(me && !r.owner) r.owner = me
  save(); renderResList(page); alert('Onder voorbehoud. Betalen pas bij activeren.')
}

function joinExact(page){
  const date = page.querySelector('#slot-date').value
  const hour = +page.querySelector('#slot-hour').value
  const dur  = +page.querySelector('#slot-dur').value
  const start = toISODateHour(date,hour), end = toISODateHour(date,hour+dur)
  let r = STORE.reservations.find(x=>x.boatId===STORE.currentBoatId && x.start===start && x.end===end)
  if(!r) return alert('Geen exact slot gevonden')
  if(!r.shareCode || !/^\d{4}$/.test(r.shareCode)) r.shareCode = generateShareCode()
  const me = STORE.currentUser?.name
  if(!me) return alert('Log in om mee te doen')
  if(r.owner && r.owner !== me && !r.users.includes(me)){
    const codeRaw = prompt('Voer de 4-cijferige deelcode in')
    if(!codeRaw || codeRaw.trim() !== r.shareCode) return alert('Onjuiste code. Vraag de code aan de host.')
  }
  if (me && !r.users.includes(me)) r.users.push(me)
  save(); renderResList(page); alert('Je doet mee met dit slot')
}

function renderResList(page){
  const box = page.querySelector('#res-list'); box.innerHTML=''
  const list = STORE.reservations.filter(r=>r.boatId===STORE.currentBoatId).sort((a,b)=>new Date(a.start)-new Date(b.start))
  if(!list.length){ box.innerHTML='<div class="muted">Nog geen reserveringen</div>'; return }
  list.forEach(r=>{
    const perPerson = (r.total/Math.max(1,r.users.length))
    const me = STORE.currentUser?.name
    const isOwner = !!me && (r.owner ? r.owner===me : r.users?.[0]===me)
    const row = document.createElement('div'); row.className='card strong'
    row.innerHTML = `
      <div class="row" style="justify-content:space-between; align-items:flex-start">
        <div>
          <strong>${new Date(r.start).toLocaleString()}</strong> → ${new Date(r.end).toLocaleString()}<br/>
          <span class="muted">Deelnemers: ${r.users.join(', ')||'—'}</span>
        </div>
        <div class="pill">${r.status}</div>
      </div>
      <div class="muted" style="margin-top:6px">Kosten: ${r.total.toFixed(3)} pt (~${perPerson.toFixed(3)} p.p.)</div>
      <div class="row" style="margin-top:10px; gap:8px; flex-wrap:wrap">
        <span class="pill ghost">${isOwner ? `Deelcode: ${r.shareCode||'Nog niet gegenereerd'}` : 'Code alleen zichtbaar voor host'}</span>
        <button class="small" data-share>Open deelpagina</button>
      </div>
    `
    row.querySelector('[data-share]').onclick = () => {
      STORE.currentBoatId = r.boatId
      STORE.sharePrefillCode = isOwner ? r.shareCode : null
      navigate('share')
    }
    box.appendChild(row)
  })
}
