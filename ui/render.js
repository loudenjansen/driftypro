import { getRoute, navigate } from './router.js'
import { renderLogin } from './components/auth.js'
import { renderHome } from './components/map.js'
import { renderBoat } from './components/reservationList.js'
import { renderProfile } from './components/profile.js'
import { renderAdmin } from './components/admin.js'
import { renderLeaderboard } from './components/leaderboard.js'
import { renderShop } from './components/shop.js'
import { renderShare } from './components/share.js'
import { renderSocial } from './components/social.js'
import { STORE } from '../state/store.js'

export function renderApp(){
  const app = document.getElementById('app')
  const route = getRoute()
  app.innerHTML = ''

  if (route === 'login') return app.appendChild(renderLogin())
  if (route === 'home')  return app.appendChild(renderHome())
  if (route === 'boat')  return app.appendChild(renderBoat())
  if (route === 'shop')  return app.appendChild(renderShop())
  if (route === 'share') return app.appendChild(renderShare())
  if (route === 'social') return app.appendChild(renderSocial())
  if (route === 'profile') return app.appendChild(renderProfile())
  if (route === 'admin'){
    if (STORE.currentUser?.isAdmin) return app.appendChild(renderAdmin())
    navigate('home'); return app.appendChild(renderHome())
  }
  if (route === 'leader') return app.appendChild(renderLeaderboard())

  navigate('home')
}
