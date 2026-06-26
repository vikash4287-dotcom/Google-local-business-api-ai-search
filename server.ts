import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import Razorpay from 'razorpay';
import crypto from 'crypto';

dotenv.config({ override: true });

let razorpayInstance: any = null;
function getRazorpay() {
  if (!razorpayInstance) {
    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_T6BQv8610PFQxC';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || '4pE6rDTkljAgMVj6yOclM2Xn';
    
    if (!keyId || !keySecret) {
      throw new Error('Razorpay credentials are not fully configured in environment variables');
    }
    // @ts-ignore
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }
  return razorpayInstance;
}

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

  // API endpoint for AI Outreach Toolkit Generation
  app.post('/api/generate-outreach-toolkit', async (req, res) => {
    try {
      const { 
        name, 
        category, 
        city, 
        website, 
        rating, 
        reviewCount, 
        deficits, 
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

      const prompt = `
You are an elite B2B local business sales consultant, local SEO auditor, and conversion rate optimization (CRO) copywriter.
Your goal is to build an irresistible "Outreach Multi-Channel Toolkit" tailored specifically for a local business to pitch your digital agency's branding, web design, or local SEO services.

BUSINESS PROFILE:
- Business Name: ${name}
- Main Category: ${category}
- City: ${city}
- Website URL: ${website ? website : 'None registered (major digital deficit!)'}
- Google Maps Rating: ${rating !== undefined ? `${rating} ★` : 'N/A'}
- Google Maps Reviews Count: ${reviewCount !== undefined ? `${reviewCount} reviews` : 'N/A'}

IDENTIFIED DIGITAL DEFICITS / REPUTATIONAL METRICS:
${deficits && deficits.length > 0 
  ? deficits.map((def: string) => `- ${def}`).join('\n') 
  : '- Standard baseline setup. Pivot to advanced offerings like geo-targeted search advertisement, high-converting lead funnel overlays, mobile page speed compression, or voice search Schema authority.'
}

PITCH TONE/STYLE: ${tone} (Ensure this style directly shapes the phrasing of every item in this toolkit)
${customInstructions ? `ADDITIONAL CRM / CUSTOM INSTRUCTIONS TO FOLLOW: "${customInstructions}"` : ''}

You must return a cohesive JSON object conforming strictly to this format:
- coldEmail: An object representing the initial touch point.
    - subject: High-open rate, spam-filter-safe, short subject line.
    - body: Compelling, personalized, pain-focused intro, highlighting 1 specific deficit, proposing a 1-sentence quick solution, and a low-friction CTA (e.g. 5-minute chat). Includes [Your Name] and [Your Agency] placeholders.
- linkedInMessage: An object representing a warm social outreach connection.
    - body: Short, relational, highly professional networking request (max 300-400 chars). Explains you're in the same area/niche or local circle, mentions their business name constructively, and hints at helping them dominate their category locally. No spammy headers. Includes placeholders.
- whatsAppMessage: An object representing a rapid direct messaging touch point.
    - body: Casual but super professional and friendly direct chat message with relevant emojis. Short, clear, highlights value instantly with a quick easy question/CTA (e.g. "Do you have 2 mins for a quick tip for your business?"). No email headers. Includes placeholders.
- followUpEmail: An object representing a polite, high-value bump email sent 3 days later.
    - subject: Gentle follow up or quick idea regarding ${name}.
    - body: High-value follow up. Reference the previous message, provide an extra free strategic tip or competitor insight, and ask if they had a chance to look. Keep it ultra short and friendly. Contains placeholders.
- salesPitch: An object representing a powerful verbal phone sales script or elevator pitch.
    - body: A conversational verbal script written in first person ("Hi is this the owner? My name is..."). Engaging hook within 5 seconds, speaks directly about their city/neighborhood and GMB presence, handles initial hesitation gracefully, and secures an appointment/audit presentation. No email layouts. Includes placeholders.

Avoid dry generic summaries. Craft copy that feels authentic, tailored to their locale and neighborhood dynamics, with very clear formatting placeholders.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              coldEmail: {
                type: Type.OBJECT,
                properties: {
                  subject: { type: Type.STRING },
                  body: { type: Type.STRING }
                },
                required: ["subject", "body"]
              },
              linkedInMessage: {
                type: Type.OBJECT,
                properties: {
                  body: { type: Type.STRING }
                },
                required: ["body"]
              },
              whatsAppMessage: {
                type: Type.OBJECT,
                properties: {
                  body: { type: Type.STRING }
                },
                required: ["body"]
              },
              followUpEmail: {
                type: Type.OBJECT,
                properties: {
                  subject: { type: Type.STRING },
                  body: { type: Type.STRING }
                },
                required: ["subject", "body"]
              },
              salesPitch: {
                type: Type.OBJECT,
                properties: {
                  body: { type: Type.STRING }
                },
                required: ["body"]
              }
            },
            required: ["coldEmail", "linkedInMessage", "whatsAppMessage", "followUpEmail", "salesPitch"]
          }
        }
      });

      const toolkitDataStr = (response.text || '{}').trim();
      const parsedToolkit = JSON.parse(toolkitDataStr);
      
      res.json({ success: true, toolkit: parsedToolkit });

    } catch (error: any) {
      console.error('Gemini Outreach Toolkit Generator backend error:', error);
      res.status(500).json({ error: error.message || 'Failed to utilize Gemini model to generate outreach toolkit.' });
    }
  });

  // API endpoint for Website Audit Analysis
  app.post('/api/analyze-website', async (req, res) => {
    try {
      const { businessId, businessName, website, category, city } = req.body;

      if (!businessName || !website) {
        return res.status(400).json({ error: 'Business name and website URL are required.' });
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

      const prompt = `
You are an expert full-stack web developer, conversion rate optimization (CRO) specialist, and local SEO auditor.
Your job is to conduct a professional "Homepage and Digital Footprint Audit" for a local business.
Since you cannot browse the live URL in real-time, generate a highly realistic, customized, professional, and data-driven analysis of their existing, typical web presence based on their business profile and category details.

BUSINESS PROFILE:
- Business Name: ${businessName}
- Business Type/Category: ${category}
- City: ${city}
- Website URL to Audit: ${website}

Evaluate these core focus areas for their typical category-benchmark website:
1. Homepage Quality: Headline clarity, layout flow, hierarchy.
2. Mobile Friendliness: Button spacing, viewport optimization, responsive layouts.
3. Call To Actions (CTAs): Placement, urgency, frequency.
4. Trust Signals: Review embeds, badges, certificates, safety badges.
5. Contact Visibility: Phone number placement, map embed, contact form.
6. SEO Basics: Title tags, meta descriptions, localized keywords.
7. Overall Design: Color harmony, professional imagery, typography.

Return a JSON object containing:
- score: A comprehensive numeric rating (0 to 100) based on typical web design and conversion deficits for this business segment.
- strengths: A list of 2 to 4 key strengths.
- weaknesses: A list of 2 to 4 key weaknesses.
- recommendedImprovements: A list of 3 to 5 clear, actionable technical and design recommendations.
- potentialServicesToSell: A list of high-ticket agency services matching these gaps.
- estimatedProjectValue: An estimated flat-fee project price range (e.g., "$1,200 - $2,500") for implementing all recommendations.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.INTEGER, description: "A score from 0 to 100 representing website quality" },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of key strengths" },
              weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of digital weaknesses" },
              recommendedImprovements: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Recommended improvements" },
              potentialServicesToSell: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Services the agency can pitch" },
              estimatedProjectValue: { type: Type.STRING, description: "E.g. '$1,500 - $3,000'" }
            },
            required: ["score", "strengths", "weaknesses", "recommendedImprovements", "potentialServicesToSell", "estimatedProjectValue"]
          }
        }
      });

      const auditDataStr = (response.text || '{}').trim();
      const parsedAudit = JSON.parse(auditDataStr);
      
      res.json({ success: true, audit: parsedAudit });

    } catch (error: any) {
      console.error('Gemini Website Auditor backend error:', error);
      res.status(500).json({ error: error.message || 'Failed to utilize Gemini model to analyze website.' });
    }
  });

  // API endpoint for Agency Pitch Proposal Draft Generator
  app.post('/api/generate-proposal', async (req, res) => {
    try {
      const { businessId, businessName, website, category, city, rating, reviewCount } = req.body;

      if (!businessName) {
        return res.status(400).json({ error: 'Business name is required.' });
      }

      // Read GEMINI_API_KEY from environment variables
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ 
          error: 'GEMINI_API_KEY is not configured on the server. Please define it in host settings.'
        });
      }

      // Initialize GoogleGenAI SDK
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const ratingStr = rating !== undefined && rating !== null ? `${rating} / 5` : 'Unknown / Not Registered on Google Maps';
      const reviewCountStr = reviewCount !== undefined && reviewCount !== null ? `${reviewCount} reviews` : '0 or Unknown reviews';

      const prompt = `
You are a highly successful, senior Agency Sales Consultant, CRO master, and Enterprise Business Pitch Writer.
Your goal is to generate a comprehensive, highly customized, and professional "Growth & Digital Marketing Proposal" to win a contract with a local business.

BUSINESS SPECIFICATION:
- Business Name: ${businessName}
- Main Category: ${category}
- City: ${city}
- Website URL state: ${website || 'No website registered'}
- Current Google Maps Rating: ${ratingStr}
- Google Maps Reviews Count: ${reviewCountStr}

Formulate a detailed agency pitch focused on helping them modernize, optimize conversion rates, secure more local reviews/reputation, and expand customer base.
You must return a cohesive JSON object conforming strictly to this format:
- executiveSummary: A brilliant, persuasive paragraph greeting the business and outlining the massive missed opportunities in their local market. Focus on custom category growth targets (e.g., if restaurant, speak about online bookings and visual menus; if plumber, speak about instant dispatch CTAs and reviews).
- businessProblems: A list of 3 specific, painful business problems they likely face based on their digital footprints (e.g. lost leads into black-hole contact forms, lack of automated review generation, high client acquisition cost).
- websiteIssues: A list of 3 detailed problems with their current homepage user interface or complete lack thereof (e.g., non-responsive contact forms, buried telephone numbers, no social proof above the fold).
- reviewAndReputationIssues: A list of 3 problems with their review patterns or search visibility (e.g. low absolute review count compared to city competitor benchmarks, slow review velocity, missing structured Schema markup).
- recommendedServices: A list of 4 highly compelling, lucrative agency services you are pitching to them (e.g., "Full-Stack Landing Page Design & CRO Launch", "Automated Local Review Accelerator Setup", "Locally-Optimized SEO & Schema Engine").
- expectedResults: A list of 3 tangible, lucrative results they can expect (e.g. "+35% uplift in inbound phone booking clicks within 60 days", "+2.5x increase in 5-star Google review velocity").
- pricingRecommendations: A descriptive pricing outline (e.g., flat fee setup of $1,800 + monthly retainer of $350 for reputational monitoring). Explain the value and return.
- timeline: A phased workflow launch summary (e.g., Week 1-2: Audit & Technical Blueprint; Week 3-4: Conversion Engine Development; Week 5: Launch & Integration).
- nextSteps: A list of 3 items describing how to get started (e.g., "Schedule a 15-minute alignment kickoff call", "Approve terms & complete initial client questionnaire").

Maintain an authoritative, consultative, professional, and exciting tone. Avoid vague generic summaries; write in highly custom details directly referencing the business type.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              executiveSummary: { type: Type.STRING, description: "Detailed executive summary greeting" },
              businessProblems: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific market problems" },
              websiteIssues: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Deficits in conversion structure" },
              reviewAndReputationIssues: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Deficits in public reputational review score" },
              recommendedServices: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Core solutions offered" },
              expectedResults: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Estimated KPI impacts" },
              pricingRecommendations: { type: Type.STRING, description: "Contract pricing breakdown and setup" },
              timeline: { type: Type.STRING, description: "Iterative workflow phase timeline" },
              nextSteps: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Step-by-step startup recommendations" }
            },
            required: ["executiveSummary", "businessProblems", "websiteIssues", "reviewAndReputationIssues", "recommendedServices", "expectedResults", "pricingRecommendations", "timeline", "nextSteps"]
          }
        }
      });

      const proposalDataStr = (response.text || '{}').trim();
      const parsedProposal = JSON.parse(proposalDataStr);
      
      res.json({ success: true, proposal: parsedProposal });

    } catch (error: any) {
      console.error('Gemini Proposal Generator backend error:', error);
      res.status(500).json({ error: error.message || 'Failed to utilize Gemini model to generate custom proposal.' });
    }
  });

  // API endpoint for Custom Service Package Tiered Builder
  app.post('/api/generate-packages', async (req, res) => {
    try {
      const { businessId, businessName, website, category, city } = req.body;

      if (!businessName) {
        return res.status(400).json({ error: 'Business name is required.' });
      }

      // Read GEMINI_API_KEY from environment variables
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ 
          error: 'GEMINI_API_KEY is not configured on the server. Please define it in host settings.'
        });
      }

      // Initialize GoogleGenAI SDK
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const prompt = `
You are an elite Digital Agency Product Architect, Package Pricing Strategist, and Local CRO Growth consultant.
Your goal is to build an irresistible 3-tiered growth service package bundle tailored specifically for a local business.

BUSINESS SPECIFICATION:
- Business Name: ${businessName}
- Main Category: ${category}
- City: ${city}
- Website URL: ${website || 'None registered'}

Create 3 specific tiers:
1. Starter Package: Groundwork & foundations. Suitable for businesses testing agency services (e.g., SEO/citation syncs, mobile UI diagnostic audits, basic local map optimization, first reputation feedback pipeline).
2. Professional Package: Conversion sweet spot. High margin, high impact tier focused on turning inbound traffic into permanent sales or appointments (e.g., custom modern landing page with CRO focus, active review boosters, local citation sweeps, performance schema overlays).
3. Premium Package: Complete niche takeover. Fully outsourced marketing retainer (e.g., bespoke web booking system, heavy-duty monthly local content & SEO campaigns, automated text-back lead responder, dedicated multi-channel lead tracking).

Calculate customized realistic local agency prices, compile specific services and deliverable titles, and estimate realistic growth and lead outcomes. Also select whether the Starter, Professional, or Premium tier is the overall "Recommended Package" based on this business context.

You must return a cohesive JSON object conforming strictly to this format:
- recommendedPackage: One of "Starter", "Professional", or "Premium"
- starter: {
    name: Title of package (e.g. "Growth Foundations")
    services: Array of 3 distinct custom services
    estimatedPricing: Price representation, e.g., "$500 setup" or "$199/mo"
    expectedOutcomes: Array of 3 expected local impacts
  }
- professional: {
    name: Title of package (e.g. "Conversion Accelerator")
    services: Array of 4 distinct custom services
    estimatedPricing: Price representation, e.g., "$1,200 setup + $250/mo"
    expectedOutcomes: Array of 3 expected local impacts
  }
- premium: {
    name: Title of package (e.g. "Market Takeover Retainer")
    services: Array of 5 distinct custom services
    estimatedPricing: Price representation, e.g., "$2,500 setup + $490/mo"
    expectedOutcomes: Array of 4 expected local impacts
  }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              recommendedPackage: { type: Type.STRING, description: "Starter, Professional, or Premium" },
              starter: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  services: { type: Type.ARRAY, items: { type: Type.STRING } },
                  estimatedPricing: { type: Type.STRING },
                  expectedOutcomes: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["name", "services", "estimatedPricing", "expectedOutcomes"]
              },
              professional: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  services: { type: Type.ARRAY, items: { type: Type.STRING } },
                  estimatedPricing: { type: Type.STRING },
                  expectedOutcomes: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["name", "services", "estimatedPricing", "expectedOutcomes"]
              },
              premium: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  services: { type: Type.ARRAY, items: { type: Type.STRING } },
                  estimatedPricing: { type: Type.STRING },
                  expectedOutcomes: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["name", "services", "estimatedPricing", "expectedOutcomes"]
              }
            },
            required: ["recommendedPackage", "starter", "professional", "premium"]
          }
        }
      });

      const packagesDataStr = (response.text || '{}').trim();
      const parsedPackages = JSON.parse(packagesDataStr);
      
      res.json({ success: true, packages: parsedPackages });

    } catch (error: any) {
      console.error('Gemini Service Packages Architect backend error:', error);
      res.status(500).json({ error: error.message || 'Failed to utilize Gemini model to draft customized service packages.' });
    }
  });

  // Razorpay Create Order Endpoint
  app.post('/api/create-order', async (req, res) => {
    try {
      const { amount, currency = 'INR', receipt = 'receipt_order_1' } = req.body;
      
      if (!amount) {
        return res.status(400).json({ error: 'Amount is required.' });
      }

      const parsedAmount = parseInt(amount, 10);
      if (isNaN(parsedAmount) || parsedAmount < 100) {
        return res.status(400).json({ error: 'Minimum amount must be at least 100 paise (1 INR).' });
      }

      const razorpay = getRazorpay();
      const options = {
        amount: parsedAmount,
        currency,
        receipt,
      };

      const order = await razorpay.orders.create(options);
      res.json({
        success: true,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency
      });
    } catch (error: any) {
      console.error('Razorpay Order Creation Error:', error);
      res.status(500).json({ error: error.message || 'Failed to create Razorpay order' });
    }
  });

  // Razorpay Verify Signature Endpoint
  app.post('/api/verify-payment', async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ error: 'Missing required parameters: razorpay_order_id, razorpay_payment_id, and razorpay_signature are required.' });
      }

      const keySecret = process.env.RAZORPAY_KEY_SECRET || '4pE6rDTkljAgMVj6yOclM2Xn';
      if (!keySecret) {
        return res.status(500).json({ error: 'Razorpay key secret is not configured on the server.' });
      }

      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generatedSignature === razorpay_signature) {
        res.json({ success: true, message: 'Payment verified successfully.' });
      } else {
        res.status(400).json({ success: false, error: 'Signature mismatch. Potential fraud detected.' });
      }
    } catch (error: any) {
      console.error('Razorpay Payment Verification Error:', error);
      res.status(500).json({ error: error.message || 'Failed to verify payment signature' });
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
