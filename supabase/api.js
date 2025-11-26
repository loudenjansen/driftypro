// drifty/supabase/api.js
// Dit bestand initialiseert de verbinding met Supabase.

import { createClient } from '@supabase/supabase-js'

// Zorg ervoor dat de URL's en sleutels beschikbaar zijn in de .env file (lokaal)
// of via Vercel Environment Variables (live).
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

// Optioneel: Exporteer de client ook via window voor oude code/debug, maar de import is leidend
window.supabaseClient = supabase;

// OPMERKING: De oude 'createCrew' functie is verhuisd naar drifty/lib/api.js
