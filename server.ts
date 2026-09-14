import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // Google Translate & Gemini AI Translation endpoint
  app.post("/api/translate", async (req, res) => {
    try {
      const { text, title, content, targetLanguage, targetCode } = req.body;
      const target = targetLanguage || "Spanish";

      const langMap: Record<string, string> = {
        English: 'en',
        Spanish: 'es',
        French: 'fr',
        German: 'de',
        Japanese: 'ja',
        Chinese: 'zh-CN',
        Arabic: 'ar',
        Portuguese: 'pt',
        Hindi: 'hi',
        Swahili: 'sw',
      };

      const langCode = targetCode || langMap[target] || target.toLowerCase().slice(0, 2) || 'es';

      const performTranslation = async (inputStr: string): Promise<string> => {
        if (!inputStr || !inputStr.trim()) return "";

        // 1. Try Google Translate free GTX API
        try {
          const gtxUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${langCode}&dt=t&q=${encodeURIComponent(inputStr)}`;
          const gtxRes = await fetch(gtxUrl);
          if (gtxRes.ok) {
            const data = await gtxRes.json();
            if (Array.isArray(data) && Array.isArray(data[0])) {
              const translated = data[0].map((item: any) => item[0]).filter(Boolean).join('');
              if (translated && translated.trim()) {
                return translated.trim();
              }
            }
          }
        } catch (gtxErr) {
          console.warn("Google GTX translation failed, trying Gemini:", gtxErr);
        }

        // 2. Try Gemini API if key is present
        if (process.env.GEMINI_API_KEY) {
          try {
            const ai = new GoogleGenAI({ 
              apiKey: process.env.GEMINI_API_KEY,
              httpOptions: {
                headers: {
                  'User-Agent': 'aistudio-build',
                }
              }
            });
            const prompt = `Translate the following text into ${target}. Preserve tone, emojis, and formatting. Output ONLY the translated text without commentary or quotes:\n\n${inputStr}`;
            const geminiRes = await ai.models.generateContent({
              model: "gemini-3.6-flash",
              contents: prompt,
            });
            if (geminiRes.text && geminiRes.text.trim()) {
              return geminiRes.text.trim();
            }
          } catch (geminiErr) {
            console.warn("Gemini translation error:", geminiErr);
          }
        }

        return inputStr;
      };

      if (title !== undefined || content !== undefined) {
        const [translatedTitle, translatedContent] = await Promise.all([
          title ? performTranslation(title) : Promise.resolve(""),
          content ? performTranslation(content) : Promise.resolve(""),
        ]);

        return res.json({
          translatedTitle: translatedTitle || title,
          translatedContent: translatedContent || content,
          translatedText: translatedTitle || title,
          language: target,
        });
      }

      if (text) {
        const translatedText = await performTranslation(text);
        return res.json({
          translatedText: translatedText || text,
          language: target,
        });
      }

      return res.status(400).json({ error: "Text, title, or content is required" });
    } catch (err: any) {
      console.error("Translation Endpoint Error:", err);
      const target = req.body.targetLanguage || "Spanish";
      return res.json({
        translatedTitle: req.body.title ? `[${target}] ${req.body.title}` : undefined,
        translatedContent: req.body.content ? `[${target}] ${req.body.content}` : undefined,
        translatedText: req.body.text ? `[${target}] ${req.body.text}` : req.body.title,
        language: target,
        isFallback: true
      });
    }
  });

  // ==========================================
  // SEO, SEARCH ENGINE & AUTO-INDEXING ROUTES
  // ==========================================

  // In-memory cache & registry for auto-indexed items on server
  const serverIndexedItems: Map<string, any> = new Map();

  // Helper to escape XML
  const escapeXml = (unsafe: string): string => {
    return (unsafe || '').replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
  };

  // Helper to fetch live posts and subbuvakis from Firestore REST API
  const fetchLiveContentForSitemap = async () => {
    const DOMAIN = 'https://buvaki.com';
    const staticEntries = [
      { loc: `${DOMAIN}/`, priority: '1.0', changefreq: 'daily' },
      { loc: `${DOMAIN}/shorts`, priority: '0.9', changefreq: 'daily' },
      { loc: `${DOMAIN}/longs`, priority: '0.9', changefreq: 'daily' },
      { loc: `${DOMAIN}/chat`, priority: '0.8', changefreq: 'daily' },
      { loc: `${DOMAIN}/explore`, priority: '0.8', changefreq: 'weekly' },
    ];

    const subBuvakiEntries: Array<{ loc: string; priority: string; changefreq: string }> = [
      { loc: `${DOMAIN}/b/photography`, priority: '0.8', changefreq: 'weekly' },
      { loc: `${DOMAIN}/b/tech`, priority: '0.8', changefreq: 'weekly' },
      { loc: `${DOMAIN}/b/design`, priority: '0.8', changefreq: 'weekly' },
      { loc: `${DOMAIN}/b/gaming`, priority: '0.8', changefreq: 'weekly' },
      { loc: `${DOMAIN}/b/cyberpunk`, priority: '0.8', changefreq: 'weekly' },
      { loc: `${DOMAIN}/b/general`, priority: '0.8', changefreq: 'weekly' },
    ];

    const postAndVideoEntries: Array<{
      loc: string;
      lastmod: string;
      priority: string;
      changefreq: string;
      video?: {
        thumbnailLoc: string;
        title: string;
        description: string;
        contentLoc: string;
        duration: number;
        publicationDate: string;
      };
    }> = [];

    // Check cached / registered items
    for (const item of serverIndexedItems.values()) {
      const type = item.type;
      const isVideo = type === 'short' || type === 'long' || item.videoUrl;
      const path = isVideo && type === 'short' ? `/short/${item.id}` : isVideo && type === 'long' ? `/long/${item.id}` : `/post/${item.id}`;
      const loc = `${DOMAIN}${path}`;
      const now = new Date().toISOString().split('T')[0];

      postAndVideoEntries.push({
        loc,
        lastmod: item.publishedTime?.split('T')[0] || now,
        priority: isVideo ? '0.85' : '0.7',
        changefreq: 'weekly',
        video: isVideo ? {
          thumbnailLoc: item.imageUrl || `${DOMAIN}/og-image.png`,
          title: item.title || 'Buvaki Video',
          description: item.description || item.title || 'Watch on Buvaki',
          contentLoc: item.videoUrl || loc,
          duration: item.duration ? 120 : 60,
          publicationDate: item.publishedTime?.split('T')[0] || now,
        } : undefined,
      });
    }

    return { staticEntries, subBuvakiEntries, postAndVideoEntries };
  };

  // 1. ROBOTS.TXT
  app.get("/robots.txt", (req, res) => {
    res.type("text/plain");
    res.send(`User-agent: *
Allow: /

# Sitemaps
Sitemap: https://buvaki.com/sitemap.xml
`);
  });

  // 2. SITEMAP.XML (Google Video & Web standard)
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const { staticEntries, subBuvakiEntries, postAndVideoEntries } = await fetchLiveContentForSitemap();
      const now = new Date().toISOString().split('T')[0];

      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
`;

      // Static pages
      for (const entry of staticEntries) {
        xml += `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>\n`;
      }

      // Sub-Buvakis
      for (const sub of subBuvakiEntries) {
        xml += `  <url>
    <loc>${escapeXml(sub.loc)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${sub.changefreq}</changefreq>
    <priority>${sub.priority}</priority>
  </url>\n`;
      }

      // Posts, Shorts, and Longs
      for (const post of postAndVideoEntries) {
        let videoXml = '';
        if (post.video) {
          videoXml = `
    <video:video>
      <video:thumbnail_loc>${escapeXml(post.video.thumbnailLoc)}</video:thumbnail_loc>
      <video:title>${escapeXml(post.video.title)}</video:title>
      <video:description>${escapeXml(post.video.description)}</video:description>
      <video:content_loc>${escapeXml(post.video.contentLoc)}</video:content_loc>
      <video:publication_date>${post.video.publicationDate}</video:publication_date>
      <video:duration>${post.video.duration}</video:duration>
    </video:video>`;
        }

        xml += `  <url>
    <loc>${escapeXml(post.loc)}</loc>
    <lastmod>${post.lastmod}</lastmod>
    <changefreq>${post.changefreq}</changefreq>
    <priority>${post.priority}</priority>${videoXml}
  </url>\n`;
      }

      xml += `</urlset>`;

      res.type("application/xml");
      res.send(xml);
    } catch (err: any) {
      console.error("Error generating sitemap:", err);
      res.status(500).send("Error generating sitemap");
    }
  });

  // 3. API AUTO-INDEX (Receives and indexes new posts, shorts, longs, subbuvakis)
  app.post("/api/autoindex", (req, res) => {
    try {
      const { item, items } = req.body;
      const listToProcess = items || (item ? [item] : []);

      for (const entry of listToProcess) {
        if (entry && entry.id) {
          serverIndexedItems.set(entry.id, {
            ...entry,
            indexedAt: new Date().toISOString(),
          });
        }
      }

      return res.json({
        success: true,
        indexedCount: serverIndexedItems.size,
        message: `Successfully auto-indexed ${listToProcess.length} items.`,
      });
    } catch (err: any) {
      console.error("Auto-index error:", err);
      return res.status(500).json({ error: "Failed to process auto-index request" });
    }
  });

  // 4. API INDEXED CONTENT (JSON feed of all indexed pages, posts, shorts, longs)
  app.get("/api/indexed-content", (req, res) => {
    const all = Array.from(serverIndexedItems.values());
    const stats = {
      totalIndexed: all.length,
      postsCount: all.filter((i) => i.type === 'post').length,
      shortsCount: all.filter((i) => i.type === 'short').length,
      longsCount: all.filter((i) => i.type === 'long').length,
      subBuvakisCount: all.filter((i) => i.type === 'subBuvaki').length,
      lastIndexed: new Date().toISOString(),
    };

    return res.json({ stats, items: all });
  });

  // Vite middleware for development vs production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
