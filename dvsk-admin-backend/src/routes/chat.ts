import { Router, Response, Request } from 'express';
import OpenAI from 'openai';
import prisma from '../config/prisma.js';

const router = Router();

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || "missing_key",
  baseURL: "https://api.groq.com/openai/v1"
});

router.post('/', async (req: Request, res: Response): Promise<any> => {
  try {
    const { messages, pastMemory, pageContext } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ message: "Invalid request: 'messages' must be an array." });
    }

    // Safety checks for DB operations to prevent crashes if DB is empty
    let totalOrders = 0, pendingOrders = 0, totalRevenue = 0, totalProducts = 0, outOfStockProducts = 0;
    
    try {
      totalOrders = await prisma.order.count();
      pendingOrders = await prisma.order.count({ where: { status: 'PENDING' } });
      const revenueResult = await prisma.order.aggregate({ _sum: { total: true } });
      totalRevenue = revenueResult._sum.total ? Number(revenueResult._sum.total) : 0;
      totalProducts = await prisma.product.count({ where: { isActive: true } });
      outOfStockProducts = await prisma.product.count({
        where: { ProductVariant: { every: { stock: 0 } } }
      });
    } catch (dbError) {
      console.error("Database connection issue in chat route:", dbError);
    }

    let contextString = "";
    if (pageContext) {
      contextString = `\n👁️ CURRENT PAGE CONTEXT (What Krishiv is looking at right now):\n${JSON.stringify(pageContext, null, 2)}\n`;
    }

    const DVSK_DYNAMIC_PROMPT = `
You are Navya, the friendly, intelligent Lead Data Analyst and Strategy Advisor for DVSK, a modern clothing brand. 
You are speaking directly to Krishiv, the founder. 

📊 CURRENT LIVE STORE DATA:
- Total Orders: ${totalOrders}
- Pending Orders: ${pendingOrders}
- Total Revenue: ₹${totalRevenue} 
- Active Products: ${totalProducts}
- Out of Stock Products: ${outOfStockProducts}
${contextString}
🧠 BACKGROUND MEMORY:
${pastMemory ? pastMemory : "No previous memory yet."}

YOUR PERSONALITY & STRICT RULES:
1. Keep it short: NEVER write long paragraphs or essays. Respond in 1 to 3 short sentences.
2. Tone: Conversational, warm, and highly analytical.
3. Context is King: ALWAYS use the "CURRENT PAGE CONTEXT", "BACKGROUND MEMORY" and "LIVE STORE DATA" above.
4. Formatting: Use a maximum of 3 very short bullet points if needed. 
5. Identity: Your name is Navya. You exist to help Krishiv run DVSK.
`;

    const completion = await openai.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: DVSK_DYNAMIC_PROMPT },
        ...messages,
      ],
    });

    return res.json({ reply: completion.choices[0].message.content });

  } catch (error: any) {
    console.error("❌ AI Error:", error?.message || error);
    if (error?.message?.includes('missing_key')) {
       return res.status(500).json({ message: "Backend error: Missing GROQ_API_KEY in .env file" });
    }
    return res.status(500).json({ message: 'AI request failed' });
  }
});

export default router;