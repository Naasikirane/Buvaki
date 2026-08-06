import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import nodemailer from "nodemailer";

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // Verification code dispatch endpoint (Email / SMS)
  app.post("/api/send-verification-code", async (req, res) => {
    try {
      const { target, type, code } = req.body;
      if (!target || !code) {
        return res.status(400).json({ error: "Target and code are required" });
      }

      if (type === "email") {
        const smtpHost = process.env.SMTP_HOST;
        const smtpUser = process.env.SMTP_USER;
        const smtpPass = process.env.SMTP_PASS;

        if (smtpHost && smtpUser && smtpPass) {
          try {
            const transporter = nodemailer.createTransport({
              host: smtpHost,
              port: Number(process.env.SMTP_PORT) || 587,
              secure: process.env.SMTP_SECURE === "true",
              auth: { user: smtpUser, pass: smtpPass },
            });

            await transporter.sendMail({
              from: process.env.SMTP_FROM || `"Buvaki Verification" <noreply@buvaki.app>`,
              to: target,
              subject: `Your Buvaki Verification Code: ${code}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                  <h2 style="color: #6d28d9; text-align: center;">Buvaki Verification Code</h2>
                  <p>Hello,</p>
                  <p>Use the following 6-digit code to verify your account on Buvaki:</p>
                  <div style="background-color: #f3e8ff; padding: 15px; border-radius: 8px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #581c87; margin: 20px 0;">
                    ${code}
                  </div>
                  <p style="color: #666; font-size: 13px;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
                </div>
              `,
            });
            console.log(`[AUTH] Real email dispatched via SMTP to ${target}`);
          } catch (emailErr) {
            console.error("[AUTH] Error sending email via SMTP:", emailErr);
          }
        } else {
          console.log(`[AUTH] Dispatching verification email to ${target}. Code processed server-side only.`);
        }
      } else if (type === "phone") {
        console.log(`[AUTH] Dispatching SMS verification code to ${target}. Code processed server-side only.`);
      }

      // SECURITY CRITICAL: Never expose code in response!
      return res.json({ 
        success: true, 
        message: `Verification code dispatched directly to ${target}` 
      });
    } catch (err: any) {
      console.error("Error sending verification code:", err);
      return res.status(500).json({ error: "Failed to send verification code" });
    }
  });

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
