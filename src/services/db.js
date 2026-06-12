/**
 * Database Connection Service
 * Professional setup for BaaS (Supabase / Firebase)
 * TODO: Add credentials when DB is ready.
 */

// import { createClient } from '@supabase/supabase-js';
// const supabaseUrl = 'YOUR_SUPABASE_URL';
// const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
// export const supabase = createClient(supabaseUrl, supabaseKey);

export const DatabaseService = {
  // ดึงข้อมูล Gigs (จำลองไปก่อน รอต่อ DB จริง)
  async getGigs() {
    try {
      // const { data, error } = await supabase.from('gigs').select('*');
      // if (error) throw error;
      // return data;
      console.log("[DB] Fetched Gigs from DB");
      return []; 
    } catch (error) {
      console.error("[DB Error] Failed to fetch gigs:", error);
      return [];
    }
  },

  // ระบบ Admin: ลบโพสต์
  async deletePost(postId, table = 'gigs') {
    try {
      // const { error } = await supabase.from(table).delete().eq('id', postId);
      // if (error) throw error;
      console.log(`[DB] Deleted post ${postId} from ${table}`);
      return true;
    } catch (error) {
      console.error("[DB Error] Failed to delete post:", error);
      return false;
    }
  },

  // ระบบ Admin: แบน User
  async banUser(userId) {
    try {
      // const { error } = await supabase.from('users').update({ status: 'banned' }).eq('id', userId);
      // if (error) throw error;
      console.log(`[DB] Banned user ${userId}`);
      return true;
    } catch (error) {
      console.error("[DB Error] Failed to ban user:", error);
      return false;
    }
  }
};
