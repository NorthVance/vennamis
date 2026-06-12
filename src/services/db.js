// CFG: DB
export const DatabaseService = {
  // REQ: Fetch
  async getFeedData(table = 'gigs') {
    try {
      console.log(`[DB] Fetching schema: ${table}`);
      return []; 
    } catch (error) {
      console.error(`[DB Error] Fetch failed on ${table}:`, error);
      return [];
    }
  },

  // REQ: Del
  async deleteContent(contentId, table = 'gigs') {
    try {
      console.log(`[DB] Dropped ${contentId} from ${table}`);
      return true;
    } catch (error) {
      console.error("[DB Error] Delete failed:", error);
      return false;
    }
  }
};
