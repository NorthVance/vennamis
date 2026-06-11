export const initialData = {
  gigs: [
    { id: 'g1', type: 'gig', host: 'Alex Corp', title: 'React Native Developer', desc: 'Build a fintech mobile app.', price: 1500, loc: 'Remote' },
    { id: 'g2', type: 'gig', host: 'Studio X', title: '3D Cyberpunk Assets', desc: 'Create blender models for game.', price: 850, loc: 'Tokyo' }
  ],
  community: [
    { id: 'c1', type: 'post', host: 'Sarah J.', title: 'Best practices for remote work?', desc: 'How do you guys manage time zones when working globally?', likes: 120, comments: 45 },
    { id: 'c2', type: 'post', host: 'DevNinja', title: 'Tailwind vs Bootstrap', desc: 'Let us settle this debate once and for all.', likes: 300, comments: 89 }
  ],
  traders: [
    { id: 't1', type: 'trade', host: 'BullMarket', title: 'NVDA Earnings Call Analysis', desc: 'Expecting a huge beat this quarter based on AI chip demand.', sentiment: 'bullish' },
    { id: 't2', type: 'trade', host: 'CryptoKing', title: 'BTC Support Levels', desc: 'Watch the 60k support level closely this weekend.', sentiment: 'bearish' }
  ],
  news: [
    { id: 'n1', type: 'news', host: 'Vennamis Official', title: 'V12 Released: Feed Ecosystem', desc: 'New floating UI and multi-verse categories added.', source: 'System Update' },
    { id: 'n2', type: 'news', host: 'Tech Insider', title: 'AI takes over freelance coding', desc: 'How generative AI is shaping the future of gig economy.', source: 'TechCrunch' }
  ]
};

export const staticDict = {
  en: { 
    nav_explore: "Explore Gigs", nav_how: "How it Works", nav_safety: "Safety", 
    btn_post: "Post Gig", badge_secure: "Global Ecosystem", 
    hero_static: "Find trusted talent for", hero_sub: "Connect with verified professionals globally. Powered by smart contracts.", 
    title_feed: "Live Global Stream",
    antiScamTitle: "Secure Workspace Policy",
    antiScamDesc: "To protect our community, please avoid sharing external links or personal contacts. All payments are secured via Escrow."
  },
  th: { 
    nav_explore: "หางาน", nav_how: "วิธีใช้งาน", nav_safety: "ความปลอดภัย", 
    btn_post: "ลงประกาศ", badge_secure: "ระบบนิเวศระดับโลก", 
    hero_static: "ค้นหาผู้เชี่ยวชาญด้าน", hero_sub: "เชื่อมต่อกับมืออาชีพทั่วโลก พร้อมระบบสัญญาอัจฉริยะ", 
    title_feed: "กระดานอัปเดตล่าสุด",
    antiScamTitle: "นโยบายความปลอดภัย",
    antiScamDesc: "เพื่อปกป้องชุมชนของเรา กรุณาหลีกเลี่ยงการแชร์ลิงก์ภายนอกหรือข้อมูลติดต่อส่วนตัว การชำระเงินทั้งหมดได้รับการคุ้มครองผ่านระบบ Escrow"
  }
};
