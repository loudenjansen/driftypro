// drifty/supabase/api.js
// Dit bestand initialiseert de verbinding met Supabase.

import { createClient } from '@supabase/supabase-js'

// Haalt de variabelen op die in Vercel zijn ingesteld met het VITE_ voorvoegsel
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL 
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
        "FATAL ERROR: SUPABASE environment variables are missing. Check your .env file or Vercel settings."
    )
}

// Initialiseer en exporteer de Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true, // Zorgt ervoor dat de gebruiker ingelogd blijft
    }
})

// Deze lijn is cruciaal omdat uw STORE de client nog steeds op deze manier zoekt.
window.supabaseClient = supabase;
