export const initialGigsData = [
    { id: "g1", type: "gig", host: "Alex Corp", title: "React Native Developer", desc: "Build a fintech mobile app.", price: 1500, loc: "Remote", tag: "Tech" },
    { id: "g2", type: "gig", host: "Studio X", title: "3D Cyberpunk Assets", desc: "Create blender models for game.", price: 850, loc: "Tokyo", tag: "Design" },
    { id: "g3", type: "gig", host: "DataFlow", title: "Python Data Scraping", desc: "Scrape e-commerce sites.", price: 300, loc: "London", tag: "Tech" }
];

export const initialCommunityData = [
    { id: "c1", type: "post", host: "Sarah J.", title: "Best practices for remote work?", desc: "How do you guys manage time zones when working globally?", likes: 120, comments: 45, tag: "Discussion" },
    { id: "c2", type: "post", host: "DevNinja", title: "Tailwind vs Bootstrap", desc: "Let us settle this debate once and for all.", likes: 300, comments: 89, tag: "Tech Talk" }
];

export const initialTradersData = [
    { id: "t1", type: "trade", host: "BullMarket", title: "NVDA Earnings Call Analysis", desc: "Expecting a huge beat this quarter based on AI chip demand.", sentiment: "bullish", tag: "Stocks" },
    { id: "t2", type: "trade", host: "CryptoKing", title: "BTC Support Levels", desc: "Watch the 60k support level closely this weekend.", sentiment: "bearish", tag: "Crypto" }
];

export const initialNewsData = [
    { id: "n1", type: "news", host: "Vennamis Official", title: "V12 Released: Feed Ecosystem", desc: "New floating UI and multi-verse categories added.", source: "System Update", tag: "Update" },
    { id: "n2", type: "news", host: "Tech Insider", title: "AI takes over freelance coding", desc: "How generative AI is shaping the future of gig economy.", source: "TechCrunch", tag: "News" }
];

export const sysTranslations = {
    en: { 
        nav_explore: "Explore Gigs", nav_how: "How it Works", nav_safety: "Safety", 
        btn_post: "Post", badge_secure: "Global Ecosystem", hero_static: "Find trusted talent for", 
        hero_sub: "Connect with verified professionals globally. Powered by smart contracts.", 
        title_feed: "Live Global Stream", applyBtn: "Apply"
    },
    th: { 
        nav_explore: "Explore", nav_how: "How it Works", nav_safety: "Safety", 
        btn_post: "Post", badge_secure: "Global Ecosystem", hero_static: "Find trusted talent for", 
        hero_sub: "Connect with verified professionals globally. Powered by smart contracts.", 
        title_feed: "Live Global Stream", applyBtn: "Apply"
    }
};

export const rotatingWords = {
    en: ["global work.", "community discussions.", "stock alpha.", "secure contracts."],
    th: ["global work.", "community discussions.", "stock alpha.", "secure contracts."]
};