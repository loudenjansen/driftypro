const KEY_ALL = 'drifty_all'
const KEY_USER = 'drifty_user'

export const storage = {
  saveAll: (obj) => localStorage.setItem(KEY_ALL, JSON.stringify(obj)),
  loadAll: () => JSON.parse(localStorage.getItem(KEY_ALL) || '{}'),
  saveUserName: (name) => localStorage.setItem(KEY_USER, name),
  loadUserName: () => localStorage.getItem(KEY_USER),
  reset: () => localStorage.clear(),
}
