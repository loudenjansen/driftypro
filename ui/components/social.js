import { STORE, save } from '../../state/store.js'
import { navigate } from '../router.js'

function renderNav(container){
  const nav = document.createElement('div')
  nav.className = 'bottom-nav'
  const isAdmin = !!STORE.currentUser?.isAdmin
  nav.innerHTML = `
    <button data-nav="home">🏠 Home</button>
    <button data-nav="share">🤝 Delen</button>
    <button data-nav="shop">🛒 Shop</button>
    <button class="active" data-nav="social">📸 Social</button>
    <button data-nav="profile">👤 Profiel</button>
    <button data-nav="leader">🏆 Leaderboard</button>
    ${isAdmin ? '<button data-nav="admin">🛠️ Admin</button>' : ''}
  `
  nav.querySelectorAll('button').forEach(btn=> btn.onclick = () => navigate(btn.dataset.nav))
  container.appendChild(nav)
}

function timeAgo(ts){
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m geleden`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}u geleden`
  const days = Math.floor(hrs / 24)
  return `${days}d geleden`
}

export function renderSocial(){
  const page = document.createElement('div')
  page.className = 'screen active'

  const username = STORE.currentUser?.name || 'Crewlid'

  page.innerHTML = `
    <div class="hero fade-card">
      <div class="row" style="justify-content:space-between; align-items:flex-start">
        <div>
          <div class="pill">TikTok-style feed</div>
          <h1>DRIFTY Social</h1>
          <p class="muted">Deel highlights van je vaart, bekijk crewmomenten en inspireer anderen.</p>
        </div>
        <button class="ghost small" id="btn-back">← Terug</button>
      </div>
      <div class="stat-grid" style="margin-top:12px">
        <div class="stat">
          <div class="label">Posts</div>
          <div class="value" id="stat-posts">${STORE.socialPosts.length}</div>
          <div class="muted">Community visuals</div>
        </div>
        <div class="stat">
          <div class="label">Crew</div>
          <div class="value">${STORE.users.length || 0}</div>
          <div class="muted">Vaarders actief</div>
        </div>
        <div class="stat">
          <div class="label">Jouw naam</div>
          <div class="value">${username}</div>
          <div class="muted">Wordt getoond bij uploads</div>
        </div>
      </div>
    </div>

    <div class="card strong">
      <div class="row" style="justify-content:space-between; align-items:center">
        <div>
          <div class="pill">Plaats een moment</div>
          <h2>Upload je foto</h2>
          <p class="muted">Voeg een beeld van je vaart toe en vertel wat er gebeurde.</p>
        </div>
        <button class="ghost small" id="btn-home">🏠 Home</button>
      </div>
      <form id="post-form" class="form-grid">
        <div>
          <label>Foto URL</label>
          <input required id="post-image" placeholder="https://..." />
        </div>
        <div>
          <label>Locatie</label>
          <input id="post-location" placeholder="Bijv. Amsterdam" />
        </div>
        <div>
          <label>Caption</label>
          <textarea required id="post-caption" rows="2" placeholder="Vertel kort wat er gebeurde"></textarea>
        </div>
        <div class="row" style="justify-content:flex-end">
          <button type="submit" class="small">Posten</button>
          <button type="button" id="btn-reset" class="secondary small">Reset</button>
        </div>
      </form>
    </div>

    <div class="section-title">📸 Crew feed</div>
    <div id="feed" class="social-feed"></div>
  `

  page.querySelector('#btn-back').onclick = () => navigate('home')
  page.querySelector('#btn-home').onclick = () => navigate('home')

  const form = page.querySelector('#post-form')
  const imgInput = page.querySelector('#post-image')
  const captionInput = page.querySelector('#post-caption')
  const locInput = page.querySelector('#post-location')
  const feed = page.querySelector('#feed')

  form.onsubmit = (e) => {
    e.preventDefault()
    const image = imgInput.value.trim()
    const caption = captionInput.value.trim()
    if (!image || !caption) return
    const post = {
      id: crypto.randomUUID?.() || 'post-' + Date.now(),
      user: username,
      caption,
      image,
      likes: 0,
      location: locInput.value.trim() || 'Onbekende locatie',
      createdAt: Date.now(),
    }
    STORE.socialPosts.unshift(post)
    save()
    form.reset()
    renderFeed()
    page.querySelector('#stat-posts').textContent = STORE.socialPosts.length
  }

  page.querySelector('#btn-reset').onclick = () => form.reset()

  function renderFeed(){
    feed.innerHTML = ''
    if (!STORE.socialPosts.length){
      feed.innerHTML = '<div class="muted">Nog geen posts. Deel je eerste moment!</div>'
      return
    }
    STORE.socialPosts.forEach(post => {
      const card = document.createElement('div')
      card.className = 'social-card fade-card'
      card.innerHTML = `
        <div class="social-media">
          <div class="social-overlay">
            <div class="pill">${post.location || 'Onbekend'}</div>
            <div class="social-meta">
              <strong>${post.user}</strong>
              <span class="muted">${timeAgo(post.createdAt)}</span>
            </div>
          </div>
          <img src="${post.image}" alt="${post.caption}" loading="lazy" />
        </div>
        <div class="social-body">
          <p>${post.caption}</p>
          <div class="row" style="justify-content:space-between; align-items:center">
            <button class="ghost small" data-like="${post.id}">💙 ${post.likes} likes</button>
            <button class="secondary small" data-share="${post.id}">Kopieer link</button>
          </div>
        </div>
      `
      card.querySelector('[data-like]').onclick = () => {
        post.likes += 1
        save()
        renderFeed()
      }
      card.querySelector('[data-share]').onclick = () => {
        navigator.clipboard?.writeText(`DRIFTY post ${post.id}`)
        card.querySelector('[data-share]').textContent = 'Gekopieerd!'
        setTimeout(() => renderFeed(), 1200)
      }
      feed.appendChild(card)
    })
  }

  renderFeed()
  renderNav(page)
  return page
}
