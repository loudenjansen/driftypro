import { storage } from './storage.js'
import { logSupabaseEvent } from '../debug/supabaseDebug.js'
// NIEUW: Importeer de API-helpers (waar onze RPC-wrappers zitten)
import { api } from '../lib/api.js' 
// NIEUW: Importeer de Supabase client (nodig voor data-selectie en Realtime)
import { supabase } from '../supabase/api.js' // PAS DIT PAD AAN als uw Supabase client elders staat!

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

// NOTE: Deze functie kan worden verwijderd als de UI volledig de share_code van de DB gebruikt.
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
  // NOTE: Deze mock data moet idealiter worden verwijderd wanneer de app volledig live is.
  if (!STORE.boats || !STORE.boats.length){
    STORE.boats = [
      { id:crypto.randomUUID?.() || 1, name:'Boot 1', x:80,  y:60,  status:'available', location:'Amsterdam' },
      { id:crypto.randomUUID?.() || 2, name:'Boot 2', x:220, y:120, status:'available', location:'Rotterdam' },
      { id:crypto.randomUUID?.() || 3, name:'Boot 3', x:340, y:160, status:'available', location:'Utrecht' },
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

// --- GEMIGREERDE FUNCTIES (Gebruiken nu de geïmporteerde 'supabase' client) ---

export async function loadBoatsFromSupabase(){
  ensureArrays()
  // Gebruik de geïmporteerde client in plaats van window?.supabaseClient
  const client = supabase 
  if (!client){
    console.error('[supabase] loadBoats error: supabase client missing')
    logSupabaseEvent('loadBoats error', { error: 'client missing' })
    STORE.boats = Array.isArray(STORE.boats) ? STORE.boats : []
    return STORE.boats
  }
  try {
    const { data, error } = await client
      .from('boats')
      .select('id, name, location, city, is_active, created_at') // Selecteer alleen benodigde kolommen
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
  // Gebruik de geïmporteerde client in plaats van window?.supabaseClient
  const client = supabase 
  if (!currentUserId || !client){
    if (!client) console.error('[supabase] loadReservations error: supabase client missing')
    if (!client) logSupabaseEvent('loadReservations error', { error: 'client missing' })
    STORE.reservations = Array.isArray(STORE.reservations) ? STORE.reservations : []
    return STORE.reservations
  }
  try {
    const { data, error } = await client
      .from('reservations')
      // Belangrijk: Selecteer nu ook share_code en total_cost
      .select('id, boat_id, start_time, end_time, status, share_code, total_cost') 
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
          shareCode: row.share_code, // Komt nu uit de DB
          totalCost: row.total_cost || 0, // Komt nu uit de DB
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

/**
 * Maakt een nieuwe reservering aan via de Supabase RPC (gebruikt api.js).
 * De backend (RPC) handelt nu de database INSERT, share code generatie en de initiële kostenverdeling af.
 * @param {object} params - Bevat userId, boatId, startTime, endTime, totalCost.
 */
export async function createReservation({ userId, boatId, startTime, endTime, totalCost }){
  ensureArrays()
  
  // 1. Roept de API helper aan (die de RPC aanroept)
  try {
    const result = await api.createReservation({ 
        boatId, 
        startTime, 
        endTime, 
        totalCost: totalCost || 0 // totalCost is nu cruciaal voor de backend
    });

    if (!result || !result.success) {
      throw new Error(result?.error || 'Reservering aanmaken mislukt via API.');
    }
    
    // 2. Map de RPC resultaten naar het lokale store object
    const reservation = {
      id: result.reservation_id,
      boatId: boatId, // result bevat niet altijd de boatId, dus gebruik de input
      start: startTime,
      end: endTime,
      status: 'confirmed', 
      users: [STORE.currentUser?.name].filter(Boolean),
      owner: STORE.currentUser?.name || null,
      shareCode: result.share_code, // Code komt nu van de backend
      totalCost: totalCost || 0,
      // newShareAmount: result.new_share_amount // Optioneel, voor weergave van de eerste kostenverdeling
    };

    // 3. Update de lokale store
    STORE.reservations.push(reservation);
    save();
    logSupabaseEvent('createReservation success (via RPC)', { id: reservation.id, boatId: boatId });
    return reservation;
  } catch(err){
    console.error('[RPC] createReservation error', err);
    logSupabaseEvent('createReservation error (RPC)', { error: err?.message || err });
    return null;
  }
}
