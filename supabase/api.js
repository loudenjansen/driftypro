// drifty/supabase/api.js
// Initialiseert de Supabase verbinding en exporteert de client.
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL 
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
        "FATAL ERROR: SUPABASE environment variables are missing. Check your .env file or Vercel settings."
    )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
    }
})

// Optioneel: Voor oudere code die window.supabaseClient gebruikt
window.supabaseClient = supabase;
