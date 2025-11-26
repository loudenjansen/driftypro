// drifty/lib/api.js
// Deze laag handelt alle communicatie met de Supabase RPC's af.

import { supabase } from '../supabase/api.js' 

// --- 1. Crew Beheer Functies ---

export async function createCrew(crewName) {
    try {
        // Gebruikt nu een RPC voor veiligheid/logica, in plaats van een directe INSERT.
        const { data, error } = await supabase.rpc('create_crew', { p_crew_name: crewName });
        if (error) throw new Error(`Crew aanmaken mislukt: ${error.message}`);
        return data; 
    } catch (e) {
        console.error('API: createCrew mislukt:', e);
        throw e;
    }
}

export async function joinCrewByCode(joinCode) {
    try {
        const { data, error } = await supabase.rpc('join_crew_by_code', { p_join_code: joinCode });
        if (error) throw new Error(`Crew joinen mislukt: ${error.message}`);
        if (!data.success) throw new Error(data.error || 'Joinen mislukt door onbekende serverfout.');
        return data;
    } catch (e) {
        console.error('API: joinCrewByCode mislukt:', e);
        throw e;
    }
}

// --- 2. Reservering & Deelnemers Beheer Functies ---

export async function createReservation(params) {
    try {
        // Roept de RPC aan die de INSERT, share_code generatie en kostenverdeling afhandelt.
        const { data, error } = await supabase.rpc('create_reservation', { 
            p_boat_id: params.boatId, 
            p_start_time: params.startTime,
            p_end_time: params.endTime,
            p_total_cost: params.totalCost // Dit is essentieel voor kostenberekening
        });

        if (error) throw new Error(`Reservering aanmaken mislukt: ${error.message}`);
        if (!data.success) throw new Error(data.error);

        // De RPC retourneert nu de reservation_id en share_code
        return data;
    } catch (e) {
        console.error('API: createReservation mislukt:', e);
        throw e;
    }
}

export async function joinReservationByShareCode(shareCode) {
    try {
        const { data, error } = await supabase.rpc('join_reservation_by_share_code', {
            p_share_code: shareCode,
        });
        if (error) throw new Error(`Joinen mislukt: ${error.message}`);
        if (!data.success) throw new Error(data.error);
        return data;
    } catch (e) {
        console.error('API: joinReservationByShareCode mislukt:', e);
        throw e;
    }
}

export async function cancelReservation(reservationId) {
    try {
        // RPC zorgt voor annulering, terugbetaling van punten en schoonmaak
        const { data, error } = await supabase.rpc('cancel_reservation', {
            p_reservation_id: reservationId,
        });
        if (error) throw new Error(`Annuleren mislukt: ${error.message}`);
        if (!data.success) throw new Error(data.error);
        return data;
    } catch (e) {
        console.error('API: cancelReservation mislukt:', e);
        throw e;
    }
}

// Groepeer alle functies in één export-object
export const api = {
    createCrew,
    joinCrewByCode,
    createReservation,
    joinReservationByShareCode,
    cancelReservation,
};
