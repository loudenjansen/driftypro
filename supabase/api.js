// drifty/supabase/api.js

import { createClient } from '@supabase/supabase-js'

// Zorg ervoor dat deze variabelen zijn ingesteld in Vercel met het VITE_ voorvoegsel!
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL 
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("FATAL ERROR: SUPABASE environment variables are missing.")
}

// Initialiseer en exporteer de Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
    }
})

// Deze lijn is CRUCIAAL, omdat uw store.js en api.js deze variabele nog steeds gebruiken.
window.supabaseClient = supabase;
