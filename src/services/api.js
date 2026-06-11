// TODO: Replace mock endpoints with actual production APIs (REST/GraphQL)

export const NetworkTranslator = {
  async translateText(text, targetLang) {
    if (!text) return "";
    
    // Detect basic Thai characters to set source language
    const isThai = [...text].some(c => c.charCodeAt(0) >= 3584 && c.charCodeAt(0) <= 3711);
    const src = isThai ? 'th' : 'en';
    
    if (src === targetLang) return text; 

    try {
      // TODO: Swap MyMemory with DeepL Pro or OpenAI API for production
      const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${src}|${targetLang}`);
      const data = await res.json();
      if (data?.responseData?.translatedText) return data.responseData.translatedText;
      return `[API Error] ${text}`;
    } catch (e) {
      console.error("Translation failed:", e);
      return text; // Fallback to original text
    }
  }
};

export const BackendAPI = {
  async fetchMetadata(url) {
    try {
      // TODO: Replace with internal backend crawler to avoid client-side CORS/Rate limits
      const res = await fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (data.status === 'success') {
        return {
          title: data.data.title || "No title available",
          desc: data.data.description || "No description available"
        };
      }
      throw new Error("Invalid Response");
    } catch (e) {
      return {
        title: `News from ${new URL(url).hostname}`,
        desc: "Auto-fetched content (Preview unavailable)"
      };
    }
  }
};
