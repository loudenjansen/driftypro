import { storage } from './storage.js'
import { logSupabaseEvent } from '../debug/supabaseDebug.js'

export const STORE = {
  users: [],
  boats: [],
  reservations: [],
  crews: [],
  crewCreation: {
    nameInput: '',
    loading: false,
  },
  weather: { code: 'green' },
  safety: {},
  docs: [],
  incidents: [],
  chats: {
    reservations: [],
    crews: [],
  },
  currentUser: null,
  currentBoatId: null,
  shopItems: [],
  chores: [],
  socialPosts: [],
  sharePrefillCode: null,
}

export function generateShareCode(){
  // Random 4-digit numeric code for sharing reservations
  return String(Math.floor(1000 + Math.random() * 9000))
}

function ensureArrays(){
  if (!Array.isArray(STORE.reservations)) STORE.reservations = []
  if (!Array.isArray(STORE.boats)) STORE.boats = []
  if (!Array.isArray(STORE.crews)) STORE.crews = []
  ensureChats()
  ensureCrewCreation()
}

function ensureChats(){
  if (!STORE.chats || typeof STORE.chats !== 'object' || Array.isArray(STORE.chats)) {
    STORE.chats = { reservations: [], crews: [] }
  }
  if (!Array.isArray(STORE.chats.reservations)) STORE.chats.reservations = []
  if (!Array.isArray(STORE.chats.crews)) STORE.chats.crews = []
}

function ensureCrewCreation(){
  if (!STORE.crewCreation || typeof STORE.crewCreation !== 'object' || Array.isArray(STORE.crewCreation)) {
    STORE.crewCreation = { nameInput: '', loading: false }
  }
  if (typeof STORE.crewCreation.nameInput !== 'string') STORE.crewCreation.nameInput = ''
  if (typeof STORE.crewCreation.loading !== 'boolean') STORE.crewCreation.loading = false
}

export function initStore(){
  ensureArrays()
  if (!STORE.boats || !STORE.boats.length){
    STORE.boats = [
      { id:1, name:'Boot 1', x:80,  y:60,  status:'available', location:'Amsterdam' },
      { id:2, name:'Boot 2', x:220, y:120, status:'available', location:'Rotterdam' },
      { id:3, name:'Boot 3', x:340, y:160, status:'available', location:'Utrecht' },
    ]
  }

  if (!STORE.shopItems || !STORE.shopItems.length){
    STORE.shopItems = [
      { id: crypto.randomUUID?.() || 'pack-50', name:'50 punten bundel', description:'Koop direct 50 punten voor snelle reserveringen.', price: 40, reward: 50, kind:'points' },
      { id: crypto.randomUUID?.() || 'tour-vip', name:'Special Night Tour', description:'Exclusieve avondtour met gids en verlichting.', price: 25, reward: 0, kind:'tour' },
      { id: crypto.randomUUID?.() || 'merch-cap', name:'DRIFTY Cap', description:'Premium navy cap met DRIFTY glow-badge.', price: 12, reward: 0, kind:'merch' },
    ]
  }

  if (!STORE.chores || !STORE.chores.length){
    STORE.chores = [
      { id: crypto.randomUUID?.() || 'clean-deck', title:'Reinig het dek', details:'Snelle poetsbeurt en check van veiligheidslijnen.', reward: 5, status:'open', claimedBy:null },
      { id: crypto.randomUUID?.() || 'refill-gear', title:'Check reddingsvesten', details:'Controleer en vul de lockers bij.', reward: 4, status:'open', claimedBy:null },
    ]
  }

  if (!STORE.socialPosts || !STORE.socialPosts.length){
    STORE.socialPosts = [
      {
        id: crypto.randomUUID?.() || 'sail-1',
        user: 'Mila',
        caption: 'Golden hour in de grachten — vloeiend water en zachte wind.',
        image: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80',
        likes: 42,
        location: 'Amsterdam',
        createdAt: Date.now() - 1000 * 60 * 60 * 6,
      },
      {
        id: crypto.randomUUID?.() || 'sail-2',
        user: 'Jasper',
        caption: 'Crew klaar, koers richting het IJ. Drifty vibes ✨',
        image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
        likes: 35,
        location: 'IJhaven',
        createdAt: Date.now() - 1000 * 60 * 60 * 12,
      },
      {
        id: crypto.randomUUID?.() || 'sail-3',
        user: 'Noor',
        caption: 'Night cruise met neon skyline — bedankt crew! 🌊',
        image: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80',
        likes: 28,
        location: 'Houthavens',
        createdAt: Date.now() - 1000 * 60 * 60 * 24,
      },
    ]
  }
}

export function ensureAdminFlag(user){
  if (!user) return false
  const isAdmin = user.name?.toLowerCase() === 'drifty'
  user.isAdmin = !!isAdmin
  return user.isAdmin
}

export function save(){
  storage.saveAll({ ...STORE, currentUser: STORE.currentUser, currentBoatId: STORE.currentBoatId })
  if (STORE.currentUser) storage.saveUserName(STORE.currentUser.name)
}

export function loadFromStorage(){
  const data = storage.loadAll()
  if (Object.keys(data).length){ Object.assign(STORE, data) }
  ensureArrays()
  const cu = storage.loadUserName()
  if (STORE.users?.length){ STORE.users.forEach(ensureAdminFlag) }
  if (cu){
    const found = STORE.users.find(u => u.name === cu)
    if (found) STORE.currentUser = found
  }
  if (STORE.currentUser) ensureAdminFlag(STORE.currentUser)
}

export async function loadBoatsFromSupabase(){
  ensureArrays()
  const client = window?.supabaseClient
  if (!client){
    console.error('[supabase] loadBoats error: supabase client missing')
    logSupabaseEvent('loadBoats error', { error: 'client missing' })
    STORE.boats = Array.isArray(STORE.boats) ? STORE.boats : []
    return STORE.boats
  }
  try {
    const { data, error } = await client
      .from('boats')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true })
    if (error) throw error
    logSupabaseEvent('loadBoats success', { count: Array.isArray(data) ? data.length : 0 })
    STORE.boats = Array.isArray(data)
      ? data.map(b => ({
          id: b.id,
          name: b.name || 'Boot',
          location: b.location || b.city || 'Onbekende locatie',
          city: b.city || b.location || '',
          status: b.is_active ? 'available' : 'inactive',
        }))
      : []
  } catch(err){
    console.error('[supabase] loadBoats error', err)
    logSupabaseEvent('loadBoats error', { error: err?.message || err })
    STORE.boats = []
  }
  save()
  return STORE.boats
}

export async function loadReservationsFromSupabase(currentUserId){
  ensureArrays()
  const client = window?.supabaseClient
  if (!currentUserId || !client){
    if (!client) console.error('[supabase] loadReservations error: supabase client missing')
    if (!client) logSupabaseEvent('loadReservations error', { error: 'client missing' })
    STORE.reservations = Array.isArray(STORE.reservations) ? STORE.reservations : []
    return STORE.reservations
  }
  try {
    const { data, error } = await client
      .from('reservations')
      .select('*')
      .eq('user_id', currentUserId)
      .order('start_time', { ascending: true })
    if (error) throw error
    logSupabaseEvent('loadReservations success', { count: Array.isArray(data) ? data.length : 0 })
    STORE.reservations = Array.isArray(data)
      ? data.map(row => ({
          id: row.id,
          boatId: row.boat_id,
          start: row.start_time,
          end: row.end_time,
          status: row.status || 'confirmed',
          users: [STORE.currentUser?.name].filter(Boolean),
          owner: STORE.currentUser?.name || null,
          shareCode: generateShareCode(),
        }))
      : []
  } catch(err){
    console.error('[supabase] loadReservations error', err)
    logSupabaseEvent('loadReservations error', { error: err?.message || err })
    STORE.reservations = Array.isArray(STORE.reservations) ? STORE.reservations : []
  }
  save()
  return STORE.reservations
}

export async function createReservation({ userId, boatId, startTime, endTime }){
  ensureArrays()
  const client = window?.supabaseClient
  if (!client){
    console.error('[supabase] createReservation error: supabase client missing')
    logSupabaseEvent('createReservation error', { error: 'client missing' })
    return null
  }
  try {
    const payload = {
      user_id: userId,
      boat_id: boatId,
      start_time: startTime,
      end_time: endTime,
      status: 'confirmed',
    }
    const { data, error } = await client.from('reservations').insert(payload).select().single()
    if (error) throw error
    logSupabaseEvent('createReservation success', { id: data?.id, boatId: boatId })
    const shareCode = generateShareCode()
    const reservation = {
      id: data.id,
      boatId: data.boat_id,
      start: data.start_time,
      end: data.end_time,
      status: data.status || 'confirmed',
      users: [STORE.currentUser?.name].filter(Boolean),
      owner: STORE.currentUser?.name || null,
      shareCode,
    }
    STORE.reservations.push(reservation)
    save()
    return reservation
  } catch(err){
    console.error('[supabase] createReservation error', err)
    logSupabaseEvent('createReservation error', { error: err?.message || err })
    return null
  }
}
