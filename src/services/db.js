import { createClient } from '@supabase/supabase-js';
import { initialData } from '../store';

// CFG: Init DB Client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = (supabaseUrl && supabaseUrl !== 'ใส่_URL_ของโปรเจกต์_Supabase_ตรงนี้') ? createClient(supabaseUrl, supabaseKey) : null;

export const DatabaseService = {
  // REQ: Fetch Feed
  async getFeedData(table = 'gigs') {
    if (!supabase) return initialData[table] || [];
    try {
      const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`[DB Error] Fetch failed on ${table}:`, error);
      return initialData[table] || [];
    }
  },

  // REQ: Insert
  async createPost(postData, table = 'gigs') {
    if (!supabase) {
      if (!initialData[table]) initialData[table] = [];
      initialData[table].unshift(postData);
      console.log(`[DB Mock] Inserted to ${table}:`, postData);
      return true;
    }
    try {
      const { error } = await supabase.from(table).insert([postData]);
      if (error) throw error;
      return true;
    } catch (error) { console.error("[DB Error] Insert failed:", error); return false; }
  },

  // 📍 REQ: Del (Updated for Mock Deletion)
  async deleteContent(contentId, table = 'gigs') {
    if (!supabase) {
      if (initialData[table]) {
        initialData[table] = initialData[table].filter(item => item.id !== contentId);
      }
      console.log(`[DB Mock] Dropped ${contentId} from ${table}`);
      return true;
    }
    try {
      const { error } = await supabase.from(table).delete().match({ id: contentId });
      if (error) throw error;
      return true;
    } catch (error) { console.error("[DB Error] Delete failed:", error); return false; }
  },

  // REQ: Public Profile Data
  async getUserProfile(userName) {
    if (!supabase) return { name: userName, bio: 'Expert digital professional. Consistently delivers secure work via Escrow.', successRate: Math.floor(Math.random() * 10 + 90), jobs: Math.floor(Math.random() * 200 + 10), rating: (Math.random() * 1 + 4).toFixed(1), joined: '2024' };
    return null;
  },

  // REQ: User Reviews
  async getReviews(userName) {
    if (!supabase) return [ { id: 'r1', client: 'DeFi Labs', comment: 'Outstanding quality. Secure and fast delivery!', rating: 5, date: '2 days ago' }, { id: 'r2', client: 'Studio X', comment: 'Good communication, highly recommended.', rating: 4.5, date: '1 week ago' } ];
    return [];
  }
};

// AUTH: Supabase IAM
export const AuthService = {
  async signUp(email, password, fullName) {
    if (!supabase) return { error: { message: 'DB Disconnected' } };
    return await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName, balance: '$0.00', avatar: fullName.substring(0,2).toUpperCase() } } });
  },
  async signIn(email, password) {
    if (!supabase) return { error: { message: 'DB Disconnected' } };
    return await supabase.auth.signInWithPassword({ email, password });
  },
  async signInWithGoogle() {
    if (!supabase) return { error: { message: 'DB Disconnected' } };
    return await supabase.auth.signInWithOAuth({ provider: 'google' });
  },
  async signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
  },
  async getSession() {
    if (!supabase) return { data: { session: null } };
    return await supabase.auth.getSession();
  }
};
