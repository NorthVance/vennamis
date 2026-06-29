import { createClient } from '@supabase/supabase-js';
import { initialData } from '../store';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = (supabaseUrl && supabaseUrl !== 'ใส่_URL_ของโปรเจกต์_Supabase_ตรงนี้') ? createClient(supabaseUrl, supabaseKey) : null;

export const DatabaseService = {
  async getFeedData(table = 'gigs') {
    if (!supabase) return initialData[table] || [];
    try { const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false }); if (error) throw error; return data || []; } 
    catch (e) { console.error(`[DB] Fetch failed:`, e); return initialData[table] || []; }
  },
  async createPost(postData, table = 'gigs') {
    if (!supabase) { if (!initialData[table]) initialData[table] = []; initialData[table].unshift(postData); return true; }
    try { const { error } = await supabase.from(table).insert([postData]); if (error) throw error; return true; } 
    catch (e) { console.error("[DB] Insert failed:", e); return false; }
  },
  async deleteContent(contentId, table = 'gigs') {
    if (!supabase) { if (initialData[table]) initialData[table] = initialData[table].filter(item => item.id !== contentId); return true; }
    try { const { error } = await supabase.from(table).delete().match({ id: contentId }); if (error) throw error; return true; } 
    catch (e) { console.error("[DB] Delete failed:", e); return false; }
  },
  // 📍 NEW: Report Engine
  async reportContent(targetId, type, reason) {
    console.log(`[SYS] Reported ${type} [${targetId}] for: ${reason}`);
    if (!supabase) return true; // Mock success
    try { const { error } = await supabase.from('reports').insert([{ target_id: targetId, type, reason }]); if (error) throw error; return true; } 
    catch (e) { console.error("[DB] Report failed:", e); return false; }
  },
  async getUserProfile(userName) {
    if (!supabase) return { name: userName, bio: 'Expert digital professional. Consistently delivers secure work via Escrow.', successRate: 98, jobs: 124, rating: 4.9, joined: '2024' };
    return null;
  },
  async getReviews(userName) {
    if (!supabase) return [ { id: 'r1', client: 'DeFi Labs', comment: 'Outstanding quality. Secure and fast delivery!', rating: 5, date: '2 days ago' }, { id: 'r2', client: 'Studio X', comment: 'Good communication, highly recommended.', rating: 4.5, date: '1 week ago' } ];
    return [];
  }
};

export const AuthService = {
  async signUp(email, password, fullName) { if (!supabase) return { error: { message: 'DB Disconnected' } }; return await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName, balance: '$0.00', avatar: fullName.substring(0,2).toUpperCase() } } }); },
  async signIn(email, password) { if (!supabase) return { error: { message: 'DB Disconnected' } }; return await supabase.auth.signInWithPassword({ email, password }); },
  async signInWithGoogle() { if (!supabase) return { error: { message: 'DB Disconnected' } }; return await supabase.auth.signInWithOAuth({ provider: 'google' }); },
  async signOut() { if (!supabase) return; await supabase.auth.signOut(); },
  async getSession() { if (!supabase) return { data: { session: null } }; return await supabase.auth.getSession(); }
};
