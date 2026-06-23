import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API endpoint for AI Pitch Generation
  app.post('/api/generate-pitch', async (req, res) => {
    try {
      const { 
        name, 
        category, 
        city, 
        website, 
        rating, 
        reviewCount, 
        deficits, 
        channel, 
        tone,
        customInstructions
      } = req.body;

      if (!name || !category) {
        return res.status(400).json({ error: 'Business name and category are required.' });
      }

      // Read GEMINI_API_KEY from environment variables
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ 
          error: 'GEMINI_API_KEY is not configured on the server. Please define it in host settings.'
        });
      }

      // Initialize GoogleGenAI SDK with recommended user-agent header
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const channelName = channel === 'linkedin' ? 'LinkedIn connection request / direct message' : 'Cold Outreach Email';
      
      const prompt = `
You are an expert digital marketing, SEO, and local growth consultant specializing in local business lead generation and high-ticket B2B sales.
Your goal is to write a highly compelling, personalized ${channelName} pitching your agency growth services to a local business based on their digital marketing deficits.

BUSINESS DETAILS:
- Business Name: ${name}
- Industry/Category: ${category}
- City/Town: ${city}
- Website: ${website ? website : 'None (No official website found - major digital gap!)'}
- Google Rating: ${rating !== undefined ? `${rating} ★` : 'N/A'}
- Google Business Profile Review Count: ${reviewCount !== undefined ? `${reviewCount} reviews` : 'N/A'}

IDENTIFIED DIGITAL DEFICITS / REPUTATIONAL METRICS:
${deficits && deficits.length > 0 
  ? deficits.map((def: string) => `- ${def}`).join('\n') 
  : '- Excellent baseline setup (the business has reviews, website, stable rating). Pivot to advanced offerings: geo-targeted search advertisement, custom conversion landing pages, speed optimizations, or voice search local SEO authority.'
}

OUTREACH CHANNEL: ${channelName}
PITCH STYLE / TONE: ${tone} (Make this tone clearly shine through in the style, word choice, and flow of your draft!)
${customInstructions ? `ADDITIONAL CRM / CUSTOM INSTRUCTIONS TO FOLLOW: "${customInstructions}"` : ''}

CRITICAL RULES FOR WRITING:
1. OUTPUT THE MESSAGE DRAFT DIRECTLY. Do not say "Here is your pitch" or include any conversational filler before or after the pitch message.
2. If it is a Cold Email, include a highly magnetic, concise, spam-free "Subject: ..." header line, then a blank line, then the email body.
3. Be specific to their neighborhood/city (${city}) and their sector (${category}). Make it clear you are a local growth partner or consultant who actually reviewed their online GMB assets.
4. Highlight how addressing their deficits directly translates to more appointments, diners, clients, or bookings (ROI-focus).
5. Outline a simple, 1-sentence fix strategy you can help them run (e.g., custom high-performance responsive landing pages, Google Business Profile review acceleration campaign, mobile-speed optimization).
6. Provide a low-friction close (CTA) asking for a brief reply or a quick 5-minute chat next week.
7. Use neat bracketed placeholders like [Your Name] or [Your Agency] at the bottom so it is obvious and quick for the user to copy-paste. Keep the overall draft extremely natural, professional, and ready to send.
`;

      // Call basic text task model gemini-3.5-flash as instructed in SKILL.md
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt
      });

      const pitchText = response.text || '';
      res.json({ success: true, pitch: pitchText });

    } catch (error: any) {
      console.error('Gemini Pitch Generator backend error:', error);
      res.status(500).json({ error: error.message || 'Failed to utilize Gemini model to generate pitch.' });
    }
  });

  // Vite middleware setup for local asset compiling in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server launched on port ${PORT}`);
  });
}

startServer();
