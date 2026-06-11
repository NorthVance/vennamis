// TODO: Replace with your actual API Keys before production deploy
const API_KEYS = {
    DEEPSEEK: 'YOUR_DEEPSEEK_API_KEY_HERE',
    DEEPL: 'YOUR_DEEPL_API_KEY_HERE'
};

export const NetworkTranslator = {
  async translateText(text, targetLang, provider = 'google') {
    if (!text) return "";
    
    // Auto-detect basic Thai source
    const isThai = [...text].some(c => c.charCodeAt(0) >= 3584 && c.charCodeAt(0) <= 3711);
    const src = isThai ? 'th' : 'en';
    
    if (src === targetLang) return text; 

    try {
      // 1. DeepSeek AI (Free/Cheap Developer API)
      if (provider === 'deepseek') {
        // TODO: Uncomment and use real fetch when API key is ready
        /*
        const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEYS.DEEPSEEK}` },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    {"role": "system", "content": `You are a professional translator. Translate the text to ${targetLang}. Only return the translated text.`},
                    {"role": "user", "content": text}
                ]
            })
        });
        const data = await res.json();
        return data.choices[0].message.content;
        */
        return `[DeepSeek AI] ${text} (Mock)`; // Temp mock
      }
      
      // 2. DeepL Pro
      if (provider === 'deepl') {
        // TODO: Insert DeepL API logic
        return `[DeepL Pro] ${text} (Mock)`;
      }

      // 3. Default: Google Translate Fallback (MyMemory Free API for demo)
      const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${src}|${targetLang}`);
      const data = await res.json();
      if (data?.responseData?.translatedText) return data.responseData.translatedText;
      return text;

    } catch (e) {
      console.error("Translation failed:", e);
      return text;
    }
  }
};

export const BackendAPI = {
  async fetchMetadata(url) {
    try {
      const res = await fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (data.status === 'success') {
        return { title: data.data.title || "No title", desc: data.data.description || "No description" };
      }
      throw new Error("Invalid Response");
    } catch (e) {
      return { title: `News from ${new URL(url).hostname}`, desc: "Auto-fetched content (Preview unavailable)" };
    }
  }
};
