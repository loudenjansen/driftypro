const BASE = import.meta.env.VITE_API_BASE_URL

export const api = {
  async health(){
    if (!BASE) return { ok:true, local:true }
    const res = await fetch(BASE + '/health')
    return res.json()
  }
}
