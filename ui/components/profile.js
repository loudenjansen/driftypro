import { STORE, save, generateShareCode, loadReservationsFromSupabase } from '../../state/store.js'
import { navigate } from '../router.js'

function ensureChatStore(){
  if(!STORE.chats || typeof STORE.chats !== 'object' || Array.isArray(STORE.chats)) STORE.chats = { reservations: [], crews: [] }
  if(!Array.isArray(STORE.chats.reservations)) STORE.chats.reservations = []
  if(!Array.isArray(STORE.chats.crews)) STORE.chats.crews = []
}

function normalizeReservation(res){
  if(!res || typeof res !== 'object') return null
  if(!Array.isArray(res.users)) res.users = []
  if(!res.shareCode || !/^\d{4}$/.test(res.shareCode)) res.shareCode = generateShareCode()
  if(!res.id) res.id = res.shareCode || crypto.randomUUID?.() || `res-${Date.now()}`
  return res
}

function getCrewId(res){
  const norm = normalizeReservation(res)
  if(!norm) return null
  return norm.shareCode || norm.id
}

function renderNav(container){
  const nav = document.createElement('div')
  nav.className = 'bottom-nav'
  const isAdmin = !!STORE.currentUser?.isAdmin
  nav.innerHTML = `
    <button data-nav="home">🏠 Home</button>
    <button data-nav="share">🤝 Delen</button>
    <button data-nav="social">📸 Social</button>
    <button data-nav="shop">🛒 Shop</button>
    <button class="active" data-nav="profile">👤 Profiel</button>
    <button data-nav="leader">🏆 Leaderboard</button>
    ${isAdmin ? '<button data-nav="admin">🛠️ Admin</button>' : ''}
  `
  nav.querySelectorAll('button').forEach(btn=> btn.onclick = () => navigate(btn.dataset.nav))
  container.appendChild(nav)
}

export function renderProfile(){
  const page = document.createElement('div')
  page.className = 'screen active'
  page.innerHTML = `
    <div class="hero fade-card">
      <div class="row" style="justify-content:space-between; align-items:flex-start">
        <div>
          <div class="pill">Mijn account</div>
          <h1>Profiel</h1>
          <p class="muted">Beheer je punten, crew en persoonlijke reserveringen in DRIFTY-stijl.</p>
        </div>
        <button class="ghost small" id="back">← Terug</button>
      </div>

      <div class="stat-grid">
        <div class="stat">
          <div class="label">Naam</div>
          <div class="value" id="p-name"></div>
          <div class="muted">Je publieke naam in de app.</div>
        </div>
        <div class="stat">
          <div class="label">Punten</div>
          <div class="value" id="p-pts"></div>
          <div class="muted">Gebruik ze voor reserveringen.</div>
        </div>
        <div class="stat">
          <div class="label">Vloot</div>
          <div class="value">${STORE.boats.length}</div>
          <div class="muted">Boten in jouw hub.</div>
        </div>
      </div>
    </div>

    <div class="layout-split">
      <div class="card fade-card">
        <div class="pill">Punten opladen</div>
        <h2>Koop punten</h2>
        <p class="muted">Vergroot je balans en claim sneller slots.</p>
        <div class="row card" style="margin-top:8px">
          <button class="small" data-add="1">+1 punt</button>
          <button class="small" data-add="5">+5 punten</button>
          <button class="small" data-add="10">+10 punten</button>
        </div>
      </div>
      <div class="card strong" id="crew-card">
        <div class="pill">Crew & delen</div>
        <h2>Deel je crew</h2>
        <p class="muted">Maak een eigen crew aan met een 4-cijferige code of sluit aan bij een host.</p>
        <div id="crew-content"></div>
      </div>
    </div>

    <div class="card fade-card" id="crew-chat-section">
      <div class="pill">Crew chat</div>
      <h2>Praat met je crew</h2>
      <p class="muted">Kies een crew en chat in de vaste ruimte. Gebruik dezelfde 4-cijferige codes als in de deel-flow.</p>
      <div id="crew-chat"></div>
    </div>

    <h2>Mijn reserveringen</h2>
    <div id="my-res" class="list-stack"></div>
  `
  page.querySelector('#back').onclick = () => navigate('home')
  page.querySelectorAll('[data-add]').forEach(btn=> btn.onclick = () => { const n=+btn.dataset.add; STORE.currentUser.points=(STORE.currentUser.points||0)+n; save(); update() })

  let reservationsHydrated = false

  function update(){
    ensureChatStore()
    page.querySelector('#p-name').textContent = STORE.currentUser?.name || '-'
    page.querySelector('#p-pts').textContent = (STORE.currentUser?.points ?? 0).toFixed(2)
    renderCrew()
    renderCrewChatSection()
    renderReservations()
  }

  async function hydrateReservations(){
    if (reservationsHydrated) return
    reservationsHydrated = true
    try {
      const userId = STORE.currentUser?.id
      if (!userId) return
      await loadReservationsFromSupabase(userId)
      update()
    } catch(err){
      console.error('[profile] hydrate reservations error', err)
    }
  }

  function getReservations(){
    if(!Array.isArray(STORE.reservations)) STORE.reservations = []
    return STORE.reservations
  }
  function getCrews(){
    if(!Array.isArray(STORE.crews)) STORE.crews = []
    return STORE.crews
  }

  function ensureCrewShape(crew){
    if(!crew) return
    if(!Array.isArray(crew.users)) crew.users = []
    if(!crew.id) crew.id = crypto.randomUUID?.() || 'crew-'+Date.now()
    if(!crew.shareCode || !/^\d{4}$/.test(crew.shareCode)) crew.shareCode = generateShareCode()
  }

  function renderCrewChatSection(){
    const box = page.querySelector('#crew-chat'); if(!box) return
    box.innerHTML = ''
    ensureChatStore()
    const me = STORE.currentUser?.name
    if(!me){ box.innerHTML = '<div class="muted">Log in om crew chat te gebruiken.</div>'; return }

    const optionsMap = new Map()
    getCrews().forEach(c => {
      try {
        ensureCrewShape(c)
        if(c.users?.includes(me)){
          const crewId = c.shareCode || c.id
          if(crewId && !optionsMap.has(crewId)) optionsMap.set(crewId, { id: crewId, label: `Crew ${crewId}`, canChat: true })
        }
      } catch(err){ console.error('[profile] crew chat crew map error', err, c) }
    })

    getReservations().forEach(r => {
      try {
        const norm = normalizeReservation(r)
        if(!norm || !Array.isArray(norm.users) || !norm.users.includes(me)) return
        const boat = (STORE.boats||[]).find(b => b.id === norm.boatId)
        const crewId = getCrewId(norm)
        const label = `${boat?.name||'Boot'} • ${norm.shareCode||crewId}`
        if(crewId && !optionsMap.has(crewId)) optionsMap.set(crewId, { id: crewId, label, canChat: true })
      } catch(err){ console.error('[profile] crew chat reservation map error', err, r) }
    })

    const options = Array.from(optionsMap.values())
    if(!options.length){ box.innerHTML = '<div class="muted">Je zit nog in geen enkele crew.</div>'; return }

    const selectorWrap = document.createElement('div')
    selectorWrap.className = 'row'
    selectorWrap.style.alignItems = 'flex-end'
    const select = document.createElement('select')
    select.style.minWidth = '220px'
    options.forEach(opt => {
      const o = document.createElement('option')
      o.value = opt.id
      o.textContent = opt.label
      select.appendChild(o)
    })
    selectorWrap.appendChild(select)
    box.appendChild(selectorWrap)

    const panel = document.createElement('div')
    panel.className = 'card'
    panel.style.marginTop = '10px'
    const messagesEl = document.createElement('div')
    messagesEl.className = 'msg'
    messagesEl.style.maxHeight = '240px'
    messagesEl.style.overflowY = 'auto'
    messagesEl.style.background = 'rgba(255,255,255,0.04)'
    messagesEl.style.border = '1px solid rgba(148, 163, 184, 0.25)'
    const inputRow = document.createElement('div')
    inputRow.className = 'row'
    inputRow.style.marginTop = '10px'
    const input = document.createElement('input')
    input.placeholder = 'Bericht voor je crew'
    const send = document.createElement('button')
    send.className = 'small'
    send.textContent = 'Verstuur'

    inputRow.appendChild(input)
    inputRow.appendChild(send)
    panel.appendChild(messagesEl)
    panel.appendChild(inputRow)
    box.appendChild(panel)

    function renderMessages(){
      messagesEl.innerHTML = ''
      const activeId = select.value
      const entry = optionsMap.get(activeId)
      const messages = (STORE.chats.crews||[]).filter(m => m.crewId === activeId).sort((a,b)=> new Date(a.createdAt) - new Date(b.createdAt))
      if(!messages.length){ messagesEl.innerHTML = '<div class="muted">Nog geen berichten in deze crew.</div>' }
      messages.forEach(m => {
        const row = document.createElement('div')
        row.className = 'msg'
        row.style.margin = '6px 0'
        row.innerHTML = `
          <div class="row" style="justify-content:space-between; gap:8px">
            <strong>${m.author||'Onbekend'}</strong>
            <span class="muted" style="font-size:12px">${new Date(m.createdAt||Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div style="margin-top:4px">${m.message||''}</div>
        `
        messagesEl.appendChild(row)
      })
      messagesEl.scrollTop = messagesEl.scrollHeight
      const canChat = !!entry?.canChat
      if(!STORE.currentUser){
        input.value = ''
        input.placeholder = 'Log in om te chatten.'
        input.disabled = true; send.disabled = true
      } else if(!canChat){
        input.value = ''
        input.placeholder = 'Je hebt geen toegang tot deze crew.'
        input.disabled = true; send.disabled = true
      } else {
        input.disabled = false; send.disabled = false
        input.placeholder = 'Bericht voor je crew'
      }
    }

    function sendMessage(){
      try {
        const activeId = select.value
        if(!STORE.currentUser){ alert('Log in om te chatten.'); return }
        if(!activeId){ alert('Geen crew geselecteerd.'); return }
        const text = (input.value||'').trim()
        if(!text) return
        STORE.chats.crews.push({ crewId: activeId, author: STORE.currentUser.name, message: text, createdAt: new Date().toISOString() })
        save()
        input.value = ''
        renderMessages()
      } catch(err){ console.error('[profile] crew chat send error', err) }
    }

    select.onchange = () => renderMessages()
    send.onclick = () => sendMessage()
    input.addEventListener('keydown', (e) => { if(e.key === 'Enter'){ e.preventDefault(); sendMessage() } })
    renderMessages()
  }

  function renderCrew(){
    const box = page.querySelector('#crew-content'); box.innerHTML = ''
    const me = STORE.currentUser?.name
    if(!me){ box.innerHTML = '<div class="muted">Log eerst in om een crew te maken of te joinen.</div>'; return }

    const crews = getCrews()
    let crew = crews.find(c => Array.isArray(c.users) && c.users.includes(me))
    if(crew){ ensureCrewShape(crew) }

    if(!crew){
      const create = document.createElement('div')
      create.className = 'list-stack'
      create.innerHTML = `
        <div class="ghost-tile">Je bent nog geen host. Start je eigen crew om een code te delen.</div>
        <div class="row" style="gap:10px; flex-wrap:wrap">
          <button class="small" id="btn-create-crew">Start mijn crew</button>
          <div class="row" style="gap:8px; align-items:flex-end; flex:1; min-width:220px">
            <div style="flex:1">
              <label>Join met code</label>
              <input id="join-code" maxlength="4" placeholder="4-cijferige code" />
            </div>
            <button class="secondary small" id="btn-join-crew">Join</button>
          </div>
        </div>
      `
      box.appendChild(create)
      create.querySelector('#btn-create-crew').onclick = () => {
        const newCrew = { owner: me, users:[me] }
        ensureCrewShape(newCrew)
        getCrews().push(newCrew)
        save(); update()
      }
      create.querySelector('#btn-join-crew').onclick = () => {
        const code = create.querySelector('#join-code').value.trim()
        if(!/^\d{4}$/.test(code)) return alert('Voer een geldige 4-cijferige code in')
        const target = crews.find(c => c.shareCode === code)
        if(!target) return alert('Geen crew gevonden met deze code')
        ensureCrewShape(target)
        if(!target.users.includes(me)) target.users.push(me)
        save(); update()
      }
      return
    }

    const isOwner = crew.owner === me
    const info = document.createElement('div')
    info.className = 'list-stack'
    info.innerHTML = `
      <div class="row" style="justify-content:space-between; align-items:center">
        <div>
          <div class="muted">Crew host: ${crew.owner||'—'}</div>
          <div class="pill ghost">${isOwner ? 'Jij bent host' : 'Gast'}</div>
        </div>
        ${isOwner ? `<button class="small" id="btn-copy-code">Code kopiëren</button>` : ''}
      </div>
      <div class="ghost-tile">${isOwner ? `Deel deze code met je crew: <strong>${crew.shareCode}</strong>` : 'Vraag de host om de 4-cijferige code om anderen toe te voegen.'}</div>
    `
    box.appendChild(info)

    if(isOwner){
      info.querySelector('#btn-copy-code').onclick = () => {
        navigator.clipboard?.writeText(crew.shareCode)
        alert('Code gekopieerd')
      }
    }

    const members = document.createElement('div')
    members.className = 'list-stack'
    members.innerHTML = '<div class="section-title">👥 Crewleden</div>'
    const list = document.createElement('div')
    list.className = 'list-stack'
    if(!crew.users.length) list.innerHTML = '<div class="muted">Nog geen leden</div>'
    crew.users.forEach(u => {
      const row = document.createElement('div')
      row.className = 'list-row'
      row.innerHTML = `<div>${u}</div>`
      if(isOwner && u !== me){
        const btn = document.createElement('button')
        btn.className = 'secondary small'
        btn.textContent = 'Verwijder'
        btn.onclick = () => {
          crew.users = crew.users.filter(x => x !== u)
          if(!crew.users.length){
            STORE.crews = crews.filter(c => c !== crew)
          }
          save(); update()
        }
        row.appendChild(btn)
      }
      list.appendChild(row)
    })
    members.appendChild(list)
    box.appendChild(members)

    const leave = document.createElement('div')
    leave.className = 'row'
    const leaveBtn = document.createElement('button')
    leaveBtn.className = 'link small'
    leaveBtn.textContent = 'Verlaat crew'
    leaveBtn.onclick = () => {
      crew.users = crew.users.filter(x => x !== me)
      if(isOwner && crew.users.length){
        crew.owner = crew.users[0]
      }
      if(!crew.users.length){ STORE.crews = crews.filter(c => c !== crew) }
      save(); update()
    }
    leave.appendChild(leaveBtn)
    box.appendChild(leave)
  }

  function renderReservationChat(res, mount, me){
    if(!mount) return
    ensureChatStore()
    const norm = normalizeReservation(res)
    if(!norm){ mount.innerHTML = '<div class="muted">Geen geldige reservering voor chat.</div>'; return }
    const canChat = !!me && Array.isArray(norm.users) && norm.users.includes(me)

    mount.innerHTML = ''
    const header = document.createElement('div')
    header.className = 'row'
    header.style.justifyContent = 'space-between'
    header.innerHTML = `<div class="pill">Chat voor deze vaart</div><div class="muted">${canChat ? 'Crew-only' : 'Alleen voor crewleden'}</div>`
    mount.appendChild(header)

    const list = document.createElement('div')
    list.className = 'msg'
    list.style.maxHeight = '200px'
    list.style.overflowY = 'auto'
    list.style.background = 'rgba(255,255,255,0.04)'
    list.style.border = '1px solid rgba(148, 163, 184, 0.25)'
    list.style.marginTop = '8px'
    mount.appendChild(list)

    const inputRow = document.createElement('div')
    inputRow.className = 'row'
    inputRow.style.marginTop = '8px'
    const input = document.createElement('input')
    input.placeholder = canChat ? 'Bericht voor deze vaart' : 'Log in of word crewlid om te chatten.'
    const send = document.createElement('button')
    send.className = 'small'
    send.textContent = 'Verstuur'
    inputRow.appendChild(input)
    inputRow.appendChild(send)
    mount.appendChild(inputRow)

    function renderMessages(){
      list.innerHTML = ''
      const msgs = (STORE.chats.reservations||[]).filter(m => m.reservationId === norm.id).sort((a,b)=> new Date(a.createdAt) - new Date(b.createdAt))
      if(!msgs.length){ list.innerHTML = '<div class="muted">Nog geen berichten voor deze vaart.</div>' }
      msgs.forEach(m => {
        const row = document.createElement('div')
        row.className = 'msg'
        row.style.margin = '6px 0'
        row.innerHTML = `
          <div class="row" style="justify-content:space-between; gap:8px">
            <strong>${m.author||'Onbekend'}</strong>
            <span class="muted" style="font-size:12px">${new Date(m.createdAt||Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div style="margin-top:4px">${m.message||''}</div>
        `
        list.appendChild(row)
      })
      list.scrollTop = list.scrollHeight
      if(!STORE.currentUser || !canChat){
        input.disabled = true; send.disabled = true
        input.placeholder = STORE.currentUser ? 'Alleen crewleden kunnen chatten.' : 'Log in om te chatten.'
      } else {
        input.disabled = false; send.disabled = false
        input.placeholder = 'Bericht voor deze vaart'
      }
    }

    function sendMessage(){
      try {
        if(!STORE.currentUser){ alert('Log in om te chatten.'); return }
        if(!canChat){ alert('Je moet crewlid zijn om te chatten.'); return }
        const text = (input.value||'').trim()
        if(!text) return
        STORE.chats.reservations.push({ reservationId: norm.id, author: STORE.currentUser.name, message: text, createdAt: new Date().toISOString() })
        save()
        input.value = ''
        renderMessages()
      } catch(err){ console.error('[profile] reservation chat send error', err) }
    }

    send.onclick = () => sendMessage()
    input.addEventListener('keydown', (e) => { if(e.key === 'Enter'){ e.preventDefault(); sendMessage() } })
    renderMessages()
  }

  function renderReservations(){
    const mineBox = page.querySelector('#my-res'); mineBox.innerHTML=''
    const me = STORE.currentUser?.name
    if(!STORE.currentUser){ mineBox.innerHTML = '<div class="muted">Log in om je reserveringen te zien.</div>'; return }
    const reservations = getReservations().filter(r => Array.isArray(r.users) && r.users.includes(me))
      .sort((a,b)=> (new Date(a.start||0)) - (new Date(b.start||0)))
    if(!reservations.length){ mineBox.innerHTML = '<div class="muted">Je hebt nog geen reserveringen.</div>'; return }

    reservations.forEach(r => {
      if(!Array.isArray(r.users)) r.users = []
      const boat = (STORE.boats||[]).find(x => x.id === r.boatId)
      const isOwner = !!me && (r.owner ? r.owner === me : r.users[0] === me)
      const el = document.createElement('div'); el.className='card strong'
      el.innerHTML = `
        <div class="row" style="justify-content:space-between; align-items:flex-start">
          <div>
            <div><strong>${boat?.name||'Boot'}</strong> — ${r.status||'open'}</div>
            <div class="muted">${new Date(r.start||Date.now()).toLocaleString()} → ${new Date(r.end||Date.now()).toLocaleString()}</div>
          </div>
          <span class="pill">${r.users.length} deelnemers</span>
        </div>
      `
      const crewList = document.createElement('div')
      crewList.className = 'list-stack'
      crewList.style.marginTop = '10px'
      r.users.forEach(u => {
        const row = document.createElement('div')
        row.className = 'list-row'
        row.innerHTML = `<div>${u}</div>`
        if(isOwner && u !== me){
          const btn = document.createElement('button')
          btn.className = 'secondary small'
          btn.textContent = 'Verwijder'
          btn.onclick = () => removeUserFromReservation(r,u)
          row.appendChild(btn)
        }
        crewList.appendChild(row)
      })
      el.appendChild(crewList)

      const actions = document.createElement('div')
      actions.className = 'row'
      const leaveBtn = document.createElement('button')
      leaveBtn.className = 'link small'
      leaveBtn.textContent = 'Verlaat reservering'
      leaveBtn.onclick = () => removeUserFromReservation(r, me)
      actions.appendChild(leaveBtn)

      if(isOwner){
        const extend = document.createElement('button')
        extend.className = 'small'
        extend.textContent = 'Een uur erbij'
        extend.onclick = () => extendReservation(r)
        actions.appendChild(extend)
      }
      const chatToggle = document.createElement('button')
      chatToggle.className = 'secondary small'
      chatToggle.textContent = 'Chat voor deze vaart'
      actions.appendChild(chatToggle)
      el.appendChild(actions)

      const chatWrap = document.createElement('div')
      chatWrap.style.display = 'none'
      chatWrap.style.marginTop = '10px'
      chatWrap.className = 'card'
      el.appendChild(chatWrap)

      chatToggle.onclick = () => {
        const visible = chatWrap.style.display === 'block'
        chatWrap.style.display = visible ? 'none' : 'block'
        if(!visible) renderReservationChat(r, chatWrap, me)
      }
      mineBox.appendChild(el)
    })
  }

  function removeUserFromReservation(res, userName){
    if(!res || !Array.isArray(res.users)) res.users = []
    res.users = res.users.filter(u => u !== userName)
    if(res.owner === userName){ res.owner = res.users[0] || null }
    if(!res.users.length){
      const idx = getReservations().findIndex(x => x.id === res.id)
      if(idx >= 0) STORE.reservations.splice(idx,1)
    }
    save(); update()
  }

  function extendReservation(res){
    const end = new Date(res.end || Date.now())
    end.setHours(end.getHours() + 1)
    res.end = end.toISOString()
    save(); update()
  }

  update()
  hydrateReservations()
  renderNav(page)
  return page
}
