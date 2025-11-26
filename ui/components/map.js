import { STORE } from '../../state/store.js'
import { navigate } from '../router.js'

function renderNav(container){
  const nav = document.createElement('div')
  nav.className = 'bottom-nav'
  const isAdmin = !!STORE.currentUser?.isAdmin
  nav.innerHTML = `
    <button class="active" data-nav="home">🏠 Home</button>
    <button data-nav="share">🤝 Delen</button>
    <button data-nav="social">📸 Social</button>
    <button data-nav="shop">🛒 Shop</button>
    <button data-nav="profile">👤 Profiel</button>
    <button data-nav="leader">🏆 Leaderboard</button>
    ${isAdmin ? '<button data-nav="admin">🛠️ Admin</button>' : ''}
  `
  nav.querySelectorAll('button').forEach(btn=> btn.onclick = () => navigate(btn.dataset.nav))
  container.appendChild(nav)
}

export function renderHome(){
  const page = document.createElement('div')
  page.className = 'screen active'
  const username = STORE.currentUser?.name || 'Gast'
  const isAdmin = !!STORE.currentUser?.isAdmin
  page.innerHTML = `
    <div class="hero fade-card">
      <div class="row" style="justify-content:space-between; align-items:flex-start">
        <div>
          <div class="pill">Control Center</div>
          <h1>Welkom, ${username}</h1>
          <p class="muted">Bekijk de vloot, claim je slot en blijf op koers. Weerstatus: <strong class="muted">${STORE.weather.code}</strong>.</p>
        </div>
        <div class="row" style="justify-content:flex-end; gap:8px">
          <button class="ghost small" id="btn-share">🤝 Deel boot</button>
          <button class="ghost small" id="btn-social">📸 Social</button>
          <button class="ghost small" id="btn-shop">🛒 Shop</button>
          <button class="ghost small" id="btn-profile">👤 Profiel</button>
          <button class="ghost small" id="btn-lead">🏆 Leaderboard</button>
          ${isAdmin ? '<button class="ghost small" id="btn-admin">🛠️ Admin</button>' : ''}
          <button class="link small" id="btn-logout">Uitloggen</button>
        </div>
      </div>

      <div class="stat-grid">
        <div class="stat">
          <div class="label">Beschikbare boten</div>
          <div class="value">${STORE.boats.filter(b=>b.status==='available').length}/${STORE.boats.length}</div>
          <div class="muted">Direct klaar voor vertrek.</div>
        </div>
        <div class="stat">
          <div class="label">Weerstatus</div>
          <div class="value">${STORE.weather.code}</div>
          <div class="muted">Gecontroleerd via de gate.</div>
        </div>
        <div class="stat">
          <div class="label">Jouw punten</div>
          <div class="value">${(STORE.currentUser?.points||0).toFixed(2)}</div>
          <div class="muted">Gebruik ze voor reserveringen.</div>
        </div>
      </div>
    </div>

    <div class="layout-split">
      <div class="card fade-card">
        <div class="row" style="justify-content:space-between; align-items:center">
          <div>
            <h2>Live kaart</h2>
            <div class="muted">Check de vlootstatus in één oogopslag.</div>
          </div>
          <span class="pill">🚦 Weer-gate: ${STORE.weather.code}</span>
        </div>
        <div id="map"></div>
        <div class="map-legend">
          <span class="pill green">🟢 Beschikbaar</span>
          <span class="pill">🟠 In gebruik</span>
          <span class="pill ghost">Glazen overlay voor zicht</span>
        </div>
      </div>
      <div class="card strong">
        <div class="row" style="justify-content:space-between; align-items:center">
          <h2>Snelle acties</h2>
          <span class="pill ghost">Korte navigatie</span>
        </div>
        <div class="list-stack" style="margin-top:6px">
          <button class="ghost" id="btn-share2">🤝 Deel een boot</button>
          <button class="ghost" id="btn-social2">📸 Social feed</button>
          <button class="ghost" id="btn-shop2">🛒 Naar shop</button>
          <button class="ghost" id="btn-profile2">👤 Mijn profiel</button>
          <button class="ghost" id="btn-lead2">🏆 Ranglijst</button>
          ${isAdmin ? '<button class="ghost" id="btn-admin2">🛠️ Admin</button>' : ''}
        </div>
        <div class="divider"></div>
        <div class="stat-grid">
          <div class="stat">
            <div class="label">Punten</div>
            <div class="value">${(STORE.currentUser?.points||0).toFixed(2)} pt</div>
            <div class="muted">Saldo voor reserveringen.</div>
          </div>
          <div class="stat">
            <div class="label">Vloot</div>
            <div class="value">${STORE.boats.length} boten</div>
            <div class="muted">Beschikbaar in DRIFTY hub.</div>
          </div>
        </div>
      </div>
    </div>

    <div class="section-title">🚤 Boten</div>
    <div id="boats-list" class="list-stack"></div>
  `

  page.querySelector('#btn-share').onclick = () => navigate('share')
  page.querySelector('#btn-social').onclick = () => navigate('social')
  page.querySelector('#btn-shop').onclick = () => navigate('shop')
  page.querySelector('#btn-profile').onclick = () => navigate('profile')
  page.querySelector('#btn-lead').onclick = () => navigate('leader')
  const adminHeroBtn = page.querySelector('#btn-admin')
  if (adminHeroBtn) adminHeroBtn.onclick = () => navigate('admin')
  page.querySelector('#btn-logout').onclick = () => { STORE.currentUser=null; localStorage.removeItem('drifty_user'); navigate('login') }
  page.querySelector('#btn-share2').onclick = () => navigate('share')
  page.querySelector('#btn-social2').onclick = () => navigate('social')
  page.querySelector('#btn-shop2').onclick = () => navigate('shop')
  page.querySelector('#btn-profile2').onclick = () => navigate('profile')
  page.querySelector('#btn-lead2').onclick = () => navigate('leader')
  const adminQuickBtn = page.querySelector('#btn-admin2')
  if (adminQuickBtn) adminQuickBtn.onclick = () => navigate('admin')

  const map = page.querySelector('#map')
  STORE.boats.forEach(b=>{
    const el = document.createElement('div')
    el.className = 'boat ' + (b.status==='available'?'ok':'busy')
    el.style.left = b.x+'px'
    el.style.top  = b.y+'px'
    el.textContent = b.name.split(' ')[1]
    el.title = b.name
    el.onclick = () => { STORE.currentBoatId=b.id; navigate('boat') }
    map.appendChild(el)
  })

  const list = page.querySelector('#boats-list')
  STORE.boats.forEach(b=>{
    const c = document.createElement('div')
    c.className = 'card strong'
    c.innerHTML = `
      <div class="row" style="justify-content:space-between; align-items:flex-start">
        <div>
          <div class="pill ghost">${b.status==='available'?'Beschikbaar':'In gebruik'}</div>
          <div style="font-weight:700; letter-spacing:-0.01em; font-size:18px; margin-top:6px">${b.name}</div>
          <div class="muted">Status: ${b.status}</div>
        </div>
        <div class="row" style="align-items:center; gap:8px">
          <span class="pill ${b.status==='available'?'green':''}">${b.status==='available'?'🟢 Ready':'🟠 Bezet'}</span>
          <button class="small" aria-label="Open ${b.name}">Details</button>
        </div>
      </div>
      <div class="muted" style="margin-top:8px">Tap om reserveringen en slots te bekijken.</div>
    `
    c.querySelector('button').onclick = () => { STORE.currentBoatId=b.id; navigate('boat') }
    list.appendChild(c)
  })

  renderNav(page)
  return page
}
