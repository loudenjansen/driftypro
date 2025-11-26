// drifty/lib/api.js

import { supabase } from '../supabase/api.js' 

// --- 1. Algemene Functies ---

export async function testSupabaseHealth() {
    try {
        // Een simpele query om de verbinding te testen
        const { error } = await supabase.from('boats').select('id').limit(1);
        return { ok: !error, local: false, error: error ? error.message : null };
    } catch (e) {
        return { ok: false, local: false, error: e.message };
    }
}

// --- 2. Crew Beheer Functies ---

export async function createCrew(crewName) {
    try {
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

// --- 3. Reservering & Deelnemers Beheer Functies ---

export async function createReservation(params) {
    try {
        // Roept de RPC aan die nu de share_code, total_cost en deelnemers afhandelt.
        const { data, error } = await supabase.rpc('create_reservation', { 
            p_boat_id: params.boatId, 
            p_start_time: params.startTime,
            p_end_time: params.endTime,
            p_total_cost: params.totalCost 
        });

        if (error) throw new Error(`Reservering aanmaken mislukt: ${error.message}`);
        if (!data.success) throw new Error(data.error);

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

export async function leaveReservation(reservationId) {
    try {
        const { data, error } = await supabase.rpc('leave_reservation', {
            p_reservation_id: reservationId,
        });
        if (error) throw new Error(`Verlaten mislukt: ${error.message}`);
        if (!data.success) throw new Error(data.error);
        return data;
    } catch (e) {
        console.error('API: leaveReservation mislukt:', e);
        throw e;
    }
}

export async function cancelReservation(reservationId) {
    try {
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

// --- 4. Chat Beheer Functies ---

export async function sendReservationMessage(reservationId, message) {
    try {
        const { data, error } = await supabase.rpc('send_reservation_message', {
            p_reservation_id: reservationId,
            p_message: message,
        });
        if (error) throw new Error(`Bericht verzenden mislukt: ${error.message}`);
        if (!data.success) throw new Error(data.error);
        return data;
    } catch (e) {
        console.error('API: sendReservationMessage mislukt:', e);
        throw e;
    }
}

export async function sendCrewMessage(crewId, message) {
    try {
        const { data, error } = await supabase.rpc('send_crew_message', {
            p_crew_id: crewId,
            p_message: message,
        });
        if (error) throw new Error(`Crew bericht verzenden mislukt: ${error.message}`);
        if (!data.success) throw new Error(data.error);
        return data;
    } catch (e) {
        console.error('API: sendCrewMessage mislukt:', e);
        throw e;
    }
}

export const api = {
    testSupabaseHealth,
    createCrew,
    joinCrewByCode,
    createReservation,
    joinReservationByShareCode,
    leaveReservation,
    cancelReservation,
    sendReservationMessage,
    sendCrewMessage,
};
