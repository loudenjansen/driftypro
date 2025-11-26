import { STORE, save } from '../../state/store.js'
import { navigate } from '../router.js'

function renderNav(container){
  const nav = document.createElement('div')
  nav.className = 'bottom-nav'
  const isAdmin = !!STORE.currentUser?.isAdmin
  nav.innerHTML = `
    <button data-nav="home">🏠 Home</button>
    <button data-nav="share">🤝 Delen</button>
    <button data-nav="social">📸 Social</button>
    <button class="active" data-nav="shop">🛒 Shop</button>
    <button data-nav="profile">👤 Profiel</button>
    <button data-nav="leader">🏆 Leaderboard</button>
    ${isAdmin ? '<button data-nav="admin">🛠️ Admin</button>' : ''}
  `
  nav.querySelectorAll('button').forEach(btn=> btn.onclick = () => navigate(btn.dataset.nav))
  container.appendChild(nav)
}

function purchase(item, page){
  const user = STORE.currentUser
  if (!user) return navigate('login')
  const balance = user.points || 0
  if (balance < item.price) return alert('Onvoldoende punten voor deze aankoop')
  user.points = +(balance - item.price + (item.reward || 0)).toFixed(2)
  user.purchases = user.purchases || []
  user.purchases.push({ id:item.id, name:item.name, at:new Date().toISOString(), reward:item.reward||0, price:item.price })
  save()
  updateHighlights(page)
  alert('Aankoop voltooid!')
}

function claimChore(chore, page){
  const user = STORE.currentUser
  if (!user) return navigate('login')
  if (chore.status === 'claimed') return
  chore.status = 'claimed'
  chore.claimedBy = user.name
  user.points = +( (user.points||0) + (chore.reward||0) ).toFixed(2)
  save()
  renderChores(page)
  updateHighlights(page)
  alert(`Je hebt ${chore.reward} punten verdiend!`)
}

function renderItems(page){
  const list = page.querySelector('#shop-items')
  list.innerHTML = ''
  if(!STORE.shopItems.length){ list.innerHTML = '<div class="muted">Nog geen items</div>'; return }
  STORE.shopItems.forEach(item => {
    const el = document.createElement('div')
    el.className = 'card strong'
    el.innerHTML = `
      <div class="row" style="justify-content:space-between; align-items:flex-start">
        <div>
          <div class="pill ${item.kind==='points'?'green':''}">${item.kind==='points' ? 'Punten bundel' : item.kind}</div>
          <div style="font-weight:700; font-size:18px; margin-top:6px">${item.name}</div>
          <div class="muted">${item.description||''}</div>
        </div>
        <div class="row" style="gap:8px; align-items:center">
          <span class="pill">Prijs: ${item.price} pt</span>
          ${item.reward ? `<span class="pill green">+${item.reward} pt</span>` : ''}
          <button class="small" data-buy>Koop</button>
        </div>
      </div>
    `
    el.querySelector('[data-buy]').onclick = () => purchase(item, page)
    list.appendChild(el)
  })
}

function renderChores(page){
  const list = page.querySelector('#shop-chores')
  list.innerHTML = ''
  if(!STORE.chores.length){ list.innerHTML = '<div class="muted">Nog geen klusjes</div>'; return }
  STORE.chores.forEach(chore => {
    const row = document.createElement('div')
    row.className = 'card'
    row.innerHTML = `
      <div class="row" style="justify-content:space-between; align-items:flex-start">
        <div>
          <div class="pill">Klus</div>
          <div style="font-weight:700; font-size:17px; margin-top:4px">${chore.title}</div>
          <div class="muted">${chore.details||''}</div>
        </div>
        <div class="row" style="gap:8px; align-items:center">
          <span class="pill green">+${chore.reward} pt</span>
          ${chore.status==='claimed' ? `<span class="pill ghost">✅ ${chore.claimedBy||'voltooid'}</span>` : '<button class="small" data-claim>Claim</button>'}
        </div>
      </div>
    `
    const claimBtn = row.querySelector('[data-claim]')
    if (claimBtn) claimBtn.onclick = () => claimChore(chore, page)
    list.appendChild(row)
  })
}

function updateHighlights(page){
  if (!page) return
  const points = (STORE.currentUser?.points || 0).toFixed(2)
  page.querySelector('[data-balance]').textContent = points + ' pt'
  const purchasesBox = page.querySelector('#shop-history')
  purchasesBox.innerHTML = ''
  const history = STORE.currentUser?.purchases || []
  if(!history.length){ purchasesBox.innerHTML = '<div class="muted">Nog geen aankopen</div>'; return }
  history.slice(-4).reverse().forEach(p => {
    const item = document.createElement('div')
    item.className = 'list-row'
    item.innerHTML = `
      <div>
        <div style="font-weight:600">${p.name}</div>
        <div class="muted">${new Date(p.at).toLocaleString()}</div>
      </div>
      <div class="pill">-${p.price} / +${p.reward||0} pt</div>
    `
    purchasesBox.appendChild(item)
  })
}

export function renderShop(){
  const page = document.createElement('div')
  page.className = 'screen active'
  const username = STORE.currentUser?.name || 'Gast'
  page.innerHTML = `
    <div class="hero fade-card">
      <div class="row" style="justify-content:space-between; align-items:flex-start">
        <div>
          <div class="pill">Marketplace</div>
          <h1>DRIFTY Shop</h1>
          <p class="muted">${username}, koop punten, tours en merch. Pak ook klusjes om punten te verdienen.</p>
        </div>
        <button class="ghost small" id="back">← Terug</button>
      </div>
      <div class="stat-grid">
        <div class="stat">
          <div class="label">Saldo</div>
          <div class="value" data-balance>${(STORE.currentUser?.points||0).toFixed(2)} pt</div>
          <div class="muted">Gebruik voor reserveringen en aankopen.</div>
        </div>
        <div class="stat">
          <div class="label">Shop items</div>
          <div class="value">${STORE.shopItems.length}</div>
          <div class="muted">Beheer via admin.</div>
        </div>
        <div class="stat">
          <div class="label">Klusjes</div>
          <div class="value">${STORE.chores.length}</div>
          <div class="muted">Verdien extra punten.</div>
        </div>
      </div>
    </div>

    <div class="layout-split">
      <div class="card fade-card">
        <div class="row" style="justify-content:space-between; align-items:center">
          <h2>Shop aanbod</h2>
          <span class="pill ghost">Premium</span>
        </div>
        <div id="shop-items" class="list-stack"></div>
      </div>
      <div class="card strong">
        <h2>Mijn aankopen</h2>
        <div id="shop-history" class="list-stack"></div>
      </div>
    </div>

    <div class="section-title">🛠️ Klusjes</div>
    <div id="shop-chores" class="list-stack"></div>
  `

  page.querySelector('#back').onclick = () => navigate('home')
  renderItems(page)
  renderChores(page)
  updateHighlights(page)
  renderNav(page)
  return page
}
