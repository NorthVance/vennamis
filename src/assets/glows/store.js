export const initialGigsData = [
  { id: 'g1', type: 'gig', host: 'Alex Corp', title: 'React Native Developer', desc: 'Build a fintech mobile app.', price: 1500, loc: 'Remote' },
  { id: 'g2', type: 'gig', host: 'Studio X', title: '3D Cyberpunk Assets', desc: 'Create blender models for game.', price: 850, loc: 'Tokyo' }
];

export const initialCommunityData = [
  { id: 'c1', type: 'post', host: 'Sarah J.', title: 'Best practices for remote work?', desc: 'How do you guys manage time zones when working globally?', likes: 120, comments: 45 }
];

export const initialTradersData = [
  { id: 't1', type: 'trade', host: 'BullMarket', title: 'NVDA Earnings Call Analysis', desc: 'Expecting a huge beat this quarter.', sentiment: 'bullish' }
];

export const initialNewsData = [
  { id: 'n1', type: 'news', host: 'Vennamis Official', title: 'V12 Released: Feed Ecosystem', desc: 'New floating UI and multi-verse categories added.', source: 'System Update' }
];

export const sysTranslations = {
  en: { 
    nav_explore: "Explore Gigs", nav_how: "How it Works", btn_post: "Post Gig", badge_secure: "Global Ecosystem", 
    hero_static: "Find trusted talent for", hero_sub: "Connect with verified professionals globally. Powered by smart contracts.", 
    title_feed: "Live Global Stream", applyBtn: "Apply" 
  },
  th: { 
    nav_explore: "หางาน", nav_how: "วิธีใช้งาน", btn_post: "ลงประกาศ", badge_secure: "ระบบนิเวศระดับโลก", 
    hero_static: "ค้นหาผู้เชี่ยวชาญด้าน", hero_sub: "เชื่อมต่อกับมืออาชีพทั่วโลก พร้อมระบบสัญญาอัจฉริยะ", 
    title_feed: "กระดานอัปเดตล่าสุด", applyBtn: "สมัครด่วน" 
  }
};

export const rotatingWords = {
  en: ["global work.", "community discussions.", "stock alpha.", "secure contracts."],
  th: ["งานระดับโลก", "พูดคุยในชุมชน", "วิเคราะห์หุ้น", "สัญญาที่ปลอดภัย"]
};
