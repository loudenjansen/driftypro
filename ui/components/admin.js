import { STORE, save } from '../../state/store.js'
import { navigate } from '../router.js'

const safeUsers = () => Array.isArray(STORE.users) ? STORE.users : []
const safeShopItems = () => Array.isArray(STORE.shopItems) ? STORE.shopItems : []
const safeChores = () => Array.isArray(STORE.chores) ? STORE.chores : []
const safeReservations = () => Array.isArray(STORE.reservations) ? STORE.reservations : []
const safeBoats = () => Array.isArray(STORE.boats) ? STORE.boats : []

function renderNav(container){
  const nav = document.createElement('div')
  nav.className = 'bottom-nav'
  nav.innerHTML = `
    <button data-nav="home">🏠 Home</button>
    <button data-nav="share">🤝 Delen</button>
    <button data-nav="social">📸 Social</button>
    <button data-nav="shop">🛒 Shop</button>
    <button data-nav="profile">👤 Profiel</button>
    <button data-nav="leader">🏆 Leaderboard</button>
    <button class="active" data-nav="admin">🛠️ Admin</button>
  `
  nav.querySelectorAll('button').forEach(btn=> btn.onclick = () => navigate(btn.dataset.nav))
  container.appendChild(nav)
}

export function renderAdmin(){
  const page = document.createElement('div')
  page.className = 'screen active'
  page.innerHTML = `
    <div class="hero fade-card">
      <div class="row" style="justify-content:space-between">
        <div>
          <div class="pill">Beheer</div>
          <h1>Admin</h1>
          <p class="muted">Pas snel de weer-gate aan en bekijk alle reserveringen.</p>
        </div>
        <button class="ghost small" id="back">← Terug</button>
      </div>
    </div>

    <div class="card strong">
      <h2>Weer-gate (alleen admin)</h2>
      <div class="row" style="align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap">
        <div class="row" style="flex:1; gap:10px">
          <select id="weather"><option value="green">Groen</option><option value="yellow">Geel</option><option value="red">Rood</option></select>
          <span class="pill" id="weather-state">Huidig: ${STORE.weather.code}</span>
        </div>
        <button id="save-weather">Opslaan</button>
      </div>
      <div class="msg" style="margin-top:8px">Gebruik de gate om de vloot veilig te houden bij slecht weer.</div>
    </div>

    <div class="layout-split">
      <div class="card fade-card">
        <h2>Punten beheren</h2>
        <p class="muted">Geef of haal punten bij gebruikers.</p>
        <div class="row" style="align-items:flex-end">
          <div style="flex:1; min-width:180px">
            <label>Gebruiker</label>
            <select id="points-user"></select>
          </div>
          <div style="flex:1; min-width:140px">
            <label>Bedrag</label>
            <input id="points-amount" type="number" step="0.5" value="5" />
          </div>
          <div class="row" style="gap:8px">
            <button class="small" id="btn-add">+ Geef punten</button>
            <button class="secondary small" id="btn-remove">- Haal punten weg</button>
          </div>
        </div>
        <div class="msg">Acties worden direct opgeslagen.</div>
        <div id="points-user-list" class="list-stack" style="max-height:220px; overflow:auto; margin-top:10px"></div>
      </div>

      <div class="card strong">
        <h2>Shop beheer</h2>
        <p class="muted">Voeg shop-items toe: puntenbundels, tours, merch.</p>
        <div class="row" style="align-items:flex-end; gap:10px">
          <div style="flex:1; min-width:160px">
            <label>Naam</label>
            <input id="shop-name" placeholder="Item naam" />
          </div>
          <div style="flex:1; min-width:140px">
            <label>Type</label>
            <select id="shop-kind">
              <option value="points">Punten</option>
              <option value="tour">Tour</option>
              <option value="merch">Merch</option>
              <option value="add-on">Add-on</option>
            </select>
          </div>
        </div>
        <div class="row" style="align-items:flex-end; gap:10px">
          <div style="flex:1; min-width:140px">
            <label>Prijs (pt)</label>
            <input id="shop-price" type="number" step="1" value="10" />
          </div>
          <div style="flex:1; min-width:140px">
            <label>Beloning (pt)</label>
            <input id="shop-reward" type="number" step="1" value="0" />
          </div>
          <div style="flex:2; min-width:200px">
            <label>Beschrijving</label>
            <input id="shop-desc" placeholder="Korte omschrijving" />
          </div>
          <button class="small" id="shop-add">Item toevoegen</button>
        </div>
        <div class="row" style="align-items:flex-end; gap:10px; margin-top:6px">
          <div style="flex:1; min-width:200px">
            <label>Bestaand item</label>
            <select id="shop-edit-select"><option value="">Selecteer item</option></select>
          </div>
          <button class="secondary small" id="shop-save">Wijzigingen opslaan</button>
        </div>
        <div id="shop-admin-list" class="list-stack" style="margin-top:10px"></div>
      </div>
    </div>

    <div class="card fade-card">
      <h2>Klusjes</h2>
      <p class="muted">Zet taken uit waarmee gebruikers punten verdienen.</p>
      <div class="row" style="align-items:flex-end; gap:10px">
        <div style="flex:1; min-width:200px">
          <label>Titel</label>
          <input id="chore-title" placeholder="Bijv. Haven opruimen" />
        </div>
        <div style="flex:1; min-width:200px">
          <label>Omschrijving</label>
          <input id="chore-details" placeholder="Wat moet er gebeuren?" />
        </div>
        <div style="flex:0.5; min-width:120px">
          <label>Beloning</label>
          <input id="chore-reward" type="number" step="1" value="5" />
        </div>
        <button class="small" id="chore-add">Klusje toevoegen</button>
      </div>
      <div class="row" style="align-items:flex-end; gap:10px; margin-top:6px">
        <div style="flex:1; min-width:200px">
          <label>Bestaand klusje</label>
          <select id="chore-edit-select"><option value="">Selecteer klusje</option></select>
        </div>
        <button class="secondary small" id="chore-save">Wijzigingen opslaan</button>
      </div>
      <div id="chore-admin-list" class="list-stack" style="margin-top:10px"></div>
    </div>

    <div class="card fade-card">
      <h2>Overzicht reserveringen</h2>
      <div id="admin-res" class="list-stack"></div>
    </div>
  `

  page.querySelector('#back').onclick = () => navigate('home')
  page.querySelector('#save-weather').onclick = () => {
    STORE.weather.code = page.querySelector('#weather').value
    save(); page.querySelector('#weather-state').textContent = 'Huidig: ' + STORE.weather.code
  }

  function renderUserSelect(){
    const sel = page.querySelector('#points-user')
    const users = safeUsers()
    sel.innerHTML = users.map(u=> `<option value="${u.id}">${u.name}</option>`).join('') || '<option>Geen gebruikers</option>'

    const list = page.querySelector('#points-user-list')
    list.innerHTML = ''
    if(!users.length){ list.innerHTML = '<div class="muted">Geen gebruikers beschikbaar</div>'; return }
    users.forEach(u => {
      const row = document.createElement('div')
      const pts = Number(u.points ?? 0)
      row.className = 'list-row'
      row.innerHTML = `
        <div>
          <div style="font-weight:600">${u.name||'Onbekend'}</div>
          <div class="muted">ID: ${u.id||'–'}</div>
        </div>
        <div class="pill">${pts.toFixed(2)} pt</div>
      `
      list.appendChild(row)
    })
  }

  function updateUserPoints(delta){
    const id = page.querySelector('#points-user').value
    const amt = +page.querySelector('#points-amount').value
    if(!id || isNaN(amt)) return alert('Selecteer gebruiker en bedrag')
    const user = safeUsers().find(u=>u.id==id)
    if(!user) return
    user.points = +((user.points||0) + delta*amt).toFixed(2)
    if (STORE.currentUser?.id === user.id){ STORE.currentUser.points = user.points }
    save(); renderUserSelect(); alert('Punten bijgewerkt')
  }

  page.querySelector('#btn-add').onclick = () => updateUserPoints(1)
  page.querySelector('#btn-remove').onclick = () => updateUserPoints(-1)
  renderUserSelect()

  function renderShopList(){
    const box = page.querySelector('#shop-admin-list'); box.innerHTML=''
    const items = safeShopItems()
    const sel = page.querySelector('#shop-edit-select')
    sel.innerHTML = '<option value="">Selecteer item</option>' + (items.map(item=> `<option value="${item.id}">${item.name}</option>`).join(''))
    if(!items.length){ box.innerHTML = '<div class="muted">Nog geen items</div>'; return }
    items.forEach(item=>{
      const row = document.createElement('div')
      row.className = 'list-row'
      row.innerHTML = `
        <div>
          <div style="font-weight:600">${item.name}</div>
          <div class="muted">${item.kind} • ${item.description||''}</div>
        </div>
        <div class="pill">${item.price} pt${item.reward?` / +${item.reward}`:''}</div>
      `
      box.appendChild(row)
    })
  }

  page.querySelector('#shop-add').onclick = () => {
    const name = page.querySelector('#shop-name').value.trim()
    const kind = page.querySelector('#shop-kind').value
    const price = +page.querySelector('#shop-price').value
    const reward = +page.querySelector('#shop-reward').value
    const desc = page.querySelector('#shop-desc').value.trim()
    if(!name || isNaN(price)) return alert('Vul naam en prijs in')
    const items = safeShopItems()
    items.push({ id:crypto.randomUUID?.()||name+Date.now(), name, kind, price, reward: isNaN(reward)?0:reward, description: desc })
    STORE.shopItems = items
    save(); renderShopList(); page.querySelector('#shop-name').value=''; page.querySelector('#shop-desc').value=''
  }
  renderShopList()

  function fillShopFormFromSelection(){
    const id = page.querySelector('#shop-edit-select').value
    const item = safeShopItems().find(s=>s.id==id)
    if(!item) return
    page.querySelector('#shop-name').value = item.name||''
    page.querySelector('#shop-kind').value = item.kind||'points'
    page.querySelector('#shop-price').value = item.price ?? 0
    page.querySelector('#shop-reward').value = item.reward ?? 0
    page.querySelector('#shop-desc').value = item.description||''
  }

  page.querySelector('#shop-edit-select').onchange = fillShopFormFromSelection
  page.querySelector('#shop-save').onclick = () => {
    const id = page.querySelector('#shop-edit-select').value
    if(!id) return alert('Kies een item om te bewerken')
    const items = safeShopItems()
    const item = items.find(i=>i.id==id)
    if(!item) return alert('Item niet gevonden')
    const name = page.querySelector('#shop-name').value.trim()
    const kind = page.querySelector('#shop-kind').value
    const price = +page.querySelector('#shop-price').value
    const reward = +page.querySelector('#shop-reward').value
    const desc = page.querySelector('#shop-desc').value.trim()
    if(!name || isNaN(price)) return alert('Vul naam en prijs in')
    item.name = name
    item.kind = kind
    item.price = price
    item.reward = isNaN(reward)?0:reward
    item.description = desc
    save(); renderShopList(); alert('Item bijgewerkt')
  }

  function renderChores(){
    const box = page.querySelector('#chore-admin-list'); box.innerHTML=''
    const chores = safeChores()
    const sel = page.querySelector('#chore-edit-select')
    sel.innerHTML = '<option value="">Selecteer klusje</option>' + (chores.map(c=> `<option value="${c.id}">${c.title}</option>`).join(''))
    if(!chores.length){ box.innerHTML = '<div class="muted">Nog geen klusjes</div>'; return }
    chores.forEach(chore=>{
      const row = document.createElement('div')
      row.className = 'list-row'
      row.innerHTML = `
        <div>
          <div style="font-weight:600">${chore.title}</div>
          <div class="muted">${chore.details||''}</div>
        </div>
        <div class="pill">${chore.reward} pt • ${chore.status}</div>
      `
      box.appendChild(row)
    })
  }

  page.querySelector('#chore-add').onclick = () => {
    const title = page.querySelector('#chore-title').value.trim()
    const details = page.querySelector('#chore-details').value.trim()
    const reward = +page.querySelector('#chore-reward').value
    if(!title || isNaN(reward)) return alert('Titel en beloning zijn verplicht')
    const chores = safeChores()
    chores.push({ id:crypto.randomUUID?.()||title+Date.now(), title, details, reward, status:'open', claimedBy:null })
    STORE.chores = chores
    save(); renderChores(); page.querySelector('#chore-title').value=''; page.querySelector('#chore-details').value=''
  }
  page.querySelector('#chore-edit-select').onchange = () => {
    const id = page.querySelector('#chore-edit-select').value
    const chore = safeChores().find(c=>c.id==id)
    if(!chore) return
    page.querySelector('#chore-title').value = chore.title||''
    page.querySelector('#chore-details').value = chore.details||''
    page.querySelector('#chore-reward').value = chore.reward ?? 0
  }
  page.querySelector('#chore-save').onclick = () => {
    const id = page.querySelector('#chore-edit-select').value
    if(!id) return alert('Kies een klusje om te bewerken')
    const chore = safeChores().find(c=>c.id==id)
    if(!chore) return alert('Klusje niet gevonden')
    const title = page.querySelector('#chore-title').value.trim()
    const details = page.querySelector('#chore-details').value.trim()
    const reward = +page.querySelector('#chore-reward').value
    if(!title || isNaN(reward)) return alert('Titel en beloning zijn verplicht')
    chore.title = title
    chore.details = details
    chore.reward = reward
    save(); renderChores(); alert('Klusje bijgewerkt')
  }
  renderChores()

  function renderReservations(){
    const list = page.querySelector('#admin-res'); list.innerHTML=''
    const all = safeReservations().slice().sort((a,b)=> new Date(a.start||0) - new Date(b.start||0))
    const boats = safeBoats()
    if(!all.length){ list.innerHTML = '<div class="muted">Geen reserveringen</div>'; return }

    all.forEach(r => {
      const row = document.createElement('div')
      row.className = 'card strong'
      const startVal = r.start ? new Date(r.start).toISOString().slice(0,16) : ''
      const endVal = r.end ? new Date(r.end).toISOString().slice(0,16) : ''
      row.innerHTML = `
        <div class="row" style="justify-content:space-between; align-items:flex-start; gap:12px">
          <div>
            <div style="font-weight:600">${new Date(r.start||Date.now()).toLocaleString()} → ${new Date(r.end||Date.now()).toLocaleString()}</div>
            <div class="muted">Crew: ${(Array.isArray(r.users)?r.users:[]).join(', ') || '—'}</div>
            <div class="muted">Boot ${r.boatId || '—'}</div>
          </div>
          <div class="pill">${r.status||'pending'}</div>
        </div>
        <div class="row" style="margin-top:10px; gap:10px; flex-wrap:wrap">
          <div style="flex:1; min-width:180px">
            <label>Status</label>
            <select data-status>
              ${['pending','confirmed','active','done','canceled'].map(s=> `<option value="${s}" ${r.status===s?'selected':''}>${s}</option>`).join('')}
            </select>
          </div>
          <div style="flex:1; min-width:180px">
            <label>Boot</label>
            <select data-boat>
              ${boats.map(b=> `<option value="${b.id}" ${String(r.boatId)===String(b.id)?'selected':''}>${b.name||('Boot '+b.id)}</option>`).join('')}
            </select>
          </div>
          <div style="flex:1; min-width:200px">
            <label>Start</label>
            <input data-start type="datetime-local" value="${startVal}" />
          </div>
          <div style="flex:1; min-width:200px">
            <label>Einde</label>
            <input data-end type="datetime-local" value="${endVal}" />
          </div>
        </div>
        <div class="row" style="margin-top:10px; gap:10px; flex-wrap:wrap">
          <div style="flex:1; min-width:220px">
            <label>Gebruikers (komma gescheiden)</label>
            <input data-users placeholder="namen" value="${(Array.isArray(r.users)?r.users.join(', '):'')}" />
          </div>
          <div style="flex:1; min-width:200px">
            <label>Host / eigenaar</label>
            <input data-owner placeholder="Host" value="${r.owner||''}" />
          </div>
          <button class="small" data-save>Opslaan</button>
        </div>
      `

      row.querySelector('[data-save]').onclick = () => {
        try {
          const newStatus = row.querySelector('[data-status]').value
          const newBoat = row.querySelector('[data-boat]').value
          const newStart = row.querySelector('[data-start]').value
          const newEnd = row.querySelector('[data-end]').value
          const usersRaw = row.querySelector('[data-users]').value
          const owner = row.querySelector('[data-owner]').value.trim()
          if(newStart) r.start = new Date(newStart).toISOString()
          if(newEnd) r.end = new Date(newEnd).toISOString()
          r.status = newStatus
          r.boatId = newBoat ? (isNaN(+newBoat) ? newBoat : +newBoat) : r.boatId
          r.users = usersRaw ? usersRaw.split(',').map(u=>u.trim()).filter(Boolean) : []
          r.owner = owner || r.owner
          save(); renderReservations(); alert('Reservering bijgewerkt')
        } catch(err){
          console.error('admin update reservation', err)
          alert('Kon reservering niet opslaan')
        }
      }

      list.appendChild(row)
    })
  }
  renderReservations()

  renderNav(page)
  return page
}
