import { Router, Response, Request } from 'express';
import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

router.post('/', async (req: Request, res: Response) => {
  try {
    // ✅ 1. ADDED: Destructure pastMemory alongside messages!
    const { messages, pastMemory } = req.body;

    // Fetch real data from YOUR exact schema
    const totalOrders = await prisma.order.count();

    // Count pending orders using your OrderStatus enum
    const pendingOrders = await prisma.order.count({
      where: { status: 'PENDING' }
    });

    // Sum up total revenue using the 'total' field in your schema
    const revenueResult = await prisma.order.aggregate({
      _sum: { total: true }
    });
    // Convert Prisma Decimal to a normal number safely
    const totalRevenue = revenueResult._sum.total ? Number(revenueResult._sum.total) : 0;

    // Count active products
    const totalProducts = await prisma.product.count({
      where: { isActive: true }
    });

    // Count products where ALL variants have 0 stock
    const outOfStockProducts = await prisma.product.count({
      where: {
        ProductVariant: {
          every: { stock: 0 } // Looks at your ProductVariant model
        }
      }
    });

    // ✅ 2. ADDED: Inject Background Memory into the prompt
    const DVSK_DYNAMIC_PROMPT = `
You are the Lead Data Analyst and Strategy Advisor for DVSK, a clothing brand. 
You are speaking directly to Kashyap, the founder. 

📊 CURRENT LIVE STORE DATA (Real-time):
- Total Orders: ${totalOrders}
- Pending Orders: ${pendingOrders}
- Total Revenue: ₹${totalRevenue} 
- Active Products: ${totalProducts}
- Out of Stock Products: ${outOfStockProducts}

🧠 BACKGROUND MEMORY (Previous conversations with Kashyap):
${pastMemory ? pastMemory : "No previous memory yet. This is a new conversation."}

YOUR PERSONALITY:
- You are highly intelligent, deeply respectful, and analytical. You speak to Kashyap with the utmost respect.
- You communicate clearly and thoughtfully in natural, professional conversational language. 
- You take a "let me think about this" approach before answering complex questions. 
- You ALWAYS use the "BACKGROUND MEMORY" above. If Kashyap brings up something from the past, remember it!

YOUR ROLE:
- Krishiv relies on you for data-driven insights, market research, and strategic advice.
- You have direct access to the live store data above. If Kashyap asks "how are sales?" or "do we have pending orders?", you must use the LIVE STORE DATA to give him an exact, accurate answer.
- Break down complex ideas into easy-to-understand bullet points.
- If referencing current events, fashion trends, or tech, do your best to give him accurate information.
`;

    // 3. Send to AI
    const completion = await openai.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: DVSK_DYNAMIC_PROMPT },
        ...messages,
      ],
    });

    res.json({ reply: completion.choices[0].message.content });

  } catch (error: any) {
    console.error("❌ AI Error:", error?.message || error);
    res.status(500).json({ message: 'AI request failed' });
  }
});

export default router;