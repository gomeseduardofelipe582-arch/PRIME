import { createClient } from "@supabase/supabase-js";

const url = process.env.REACT_APP_SUPABASE_URL;
const anonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);
export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } })
  : null;

export function requireSupabase() {
  if (!supabase) throw new Error("Supabase não configurado. Preencha frontend/.env.local com as variáveis REACT_APP_SUPABASE_.");
  return supabase;
}

export function throwIfError(error) {
  if (error) throw error;
}
