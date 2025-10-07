import type { Request, Response } from 'express';
import { redis } from '../langchain/redisClient.js';
import prisma from '../db/prisma.js';
import { ChatPromptTemplate } from '@langchain/core/prompts';;
import { model } from '../langchain/model/model.js';
import { Document } from '@langchain/core/documents';
import { getRelevantChatContext } from '../langchain/vector.js';
import { saveChunksToVectorStore } from '../langchain/storeVector.js';
import crypto from "crypto";

const MAX_CHAT_HISTORY = 10;
const CACHE_TTL = 60 * 10; // 10 min

interface RecommendationRequest {
  message: string;
}
export const recommend = async (req: Request, res: Response) => {
  try {
    console.log('[START] Recommend API called');

    const userId = req.user?.id;
    const { message }: RecommendationRequest = req.body;
    console.log('[INFO] Extracted userId:', userId);
    console.log('[INFO] Received message:', message);

    if (!userId || !message?.trim()) {
      console.warn('[WARN] Missing userId or message');
      return res.status(400).json({ error: 'Missing userId or message' });
    }

    const calculateTargets = (u: {
      weight?: number;
      height?: number;
      age?: number;
      gender?: string | null;
      activityLevel?: string | null;
      goalType?: string | null;
    }) => {
      // Mifflin-St Jeor BMR
      const weight = u.weight ?? 70;
      const height = u.height ?? 170;
      const age = u.age ?? 30;
      const gender = (u.gender || '').toLowerCase();
      const bmr = 10 * weight + 6.25 * height - 5 * age + (gender === 'female' ? -161 : 5);
      // activity multiplier
      const activity = (u.activityLevel || '').toLowerCase();
      let mult = 1.2;
      if (activity.includes('light')) mult = 1.375;
      else if (activity.includes('moderate')) mult = 1.55;
      else if (activity.includes('active')) mult = 1.725;
      else if (activity.includes('very')) mult = 1.9;
      const tdee = Math.round(bmr * mult);

      // adjust by goal
      let calorieTarget = tdee;
      if (u.goalType === 'MUSCLE_GAIN') calorieTarget = Math.round(tdee + 350);
      else if (u.goalType === 'FAT_LOSS') calorieTarget = Math.round(tdee - 400);
      else if (u.goalType === 'RECOMP') calorieTarget = Math.round(tdee);

      // protein target (2.0 g/kg for recomposition/muscle focus)
      const proteinTarget = Math.round(weight * 2.0);

      return { calorieTarget, proteinTarget, tdee };
    };

    // --- 1. Cache lookup ---
    const normalizedMessage = message.toLowerCase().replace(/\s+/g, ' ').trim();
    const hash = crypto.createHash('sha256').update(userId + normalizedMessage).digest('hex');
    const cacheKey = `cache:recommend:${hash}`;
    console.log('[CACHE] Generated cacheKey:', cacheKey);

    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log('[CACHE HIT] Returning cached response');
      let conversation = await prisma.conversation.findUnique({ where: { userId: Number(userId) } });
      if (!conversation) {
        console.log('[INFO] No conversation found. Creating a new one.');
        conversation = await prisma.conversation.create({
          data: { userId: Number(userId), title: 'AI Nutrition Assistant' }
        });
      }
      return res.json({
        reply: cached,
        conversationId: conversation.id,
        messageId: 0,
        cached: true
      });
    }
    console.log('[CACHE MISS] Proceeding to fetch user data');

    // --- 2. Fetch user data ---
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    console.log('[TIME] startOfToday:', startOfToday, '| endOfToday:', endOfToday);

    const [user, goal, preferences, mealLogs, recentConversations] = await Promise.all([
      prisma.user.findUnique({
        where: { id: Number(userId) },
        select: { id: true, username: true, age: true, weight: true, height: true, gender: true, activityLevel: true, profile_completed: true }
      }),
      prisma.goal.findFirst({ where: { userId: Number(userId), isActive: true }, orderBy: { startDate: 'desc' }, select: { type: true, description: true, startDate: true, endDate: true } }),
      prisma.preferences.findUnique({ where: { userId: Number(userId) }, select: { dietType: true, allergies: true, mealFrequency: true, snackIncluded: true } }),
      prisma.mealLog.findMany({ where: { userId: Number(userId), mealDate: { gte: startOfToday, lte: endOfToday } }, orderBy: { mealDate: 'desc' } }),
      prisma.conversation.findMany({
        where: { userId: Number(userId) },
        orderBy: { updatedAt: 'desc' },
        take: 3,
        select: {
          id: true,
          title: true,
          messages: { orderBy: { createdAt: 'desc' }, take: 5, select: { senderRole: true, content: true, createdAt: true } }
        }
      })
    ]);

    console.log('[DATA FETCHED] User:', user);
    console.log('[DATA FETCHED] Goal:', goal);
    console.log('[DATA FETCHED] Preferences:', preferences);
    console.log('[DATA FETCHED] Meal Logs:', mealLogs.length);
    console.log('[DATA FETCHED] Recent Conversations:', recentConversations.length);

    if (!user || !goal || !preferences) {
      console.warn('[WARN] Required user data missing');
      return res.status(400).json({ error: 'User, goal, or preferences not found' });
    }

    // --- 3. Conversation ---
    let conversation = await prisma.conversation.findUnique({ where: { userId: Number(userId) } });
    if (!conversation) {
      conversation = await prisma.conversation.create({ data: { userId: Number(userId), title: 'AI Nutrition Assistant' } });
    }
    const currentConversationId = conversation.id;
    console.log('[INFO] Current Conversation ID:', currentConversationId);

    // --- 4. Short-term memory ---
    const recentMessages = await prisma.message.findMany({
      where: { conversationId: currentConversationId },
      orderBy: { createdAt: 'desc' },
      take: MAX_CHAT_HISTORY * 2,
      select: { senderRole: true, content: true, createdAt: true }
    });
    console.log('[MEMORY] Retrieved short-term messages:', recentMessages.length);
    const shortTermMemory = recentMessages.reverse().map(msg => `${msg.senderRole}: ${msg.content}`).join('\n');

    // --- 5. Long-term memory (vector) ---
    const vectorResults = await getRelevantChatContext(message, 5).catch(e => {
      console.warn('[VECTOR DB] retrieval failed:', e);
      return [];
    });
    console.log('[VECTOR DB] Relevant context messages:', vectorResults.length || 0);
    const vectorMemory = (vectorResults || []).join('\n');

    // --- 6. Meals summary (grouped) ---
    const mealsByType = mealLogs.reduce((acc, meal) => {
      if (!acc[meal.mealType]) acc[meal.mealType] = [];
      acc[meal.mealType]?.push(meal);
      return acc;
    }, {} as Record<string, typeof mealLogs>);

    const mealsSummary = Object.entries(mealsByType).map(([type, meals]) => {
      const totalCalories = meals.reduce((sum, m) => sum + (m.calories * (m.servings ?? 1)), 0);
      const totalProtein = meals.reduce((sum, m) => sum + (m.protein * (m.servings ?? 1)), 0);
      const totalCarbs = meals.reduce((sum, m) => sum + (m.carbs * (m.servings ?? 1)), 0);
      const totalFats = meals.reduce((sum, m) => sum + (m.fats * (m.servings ?? 1)), 0);
      return `${type}: ${meals.length} items, ${totalCalories.toFixed(0)} kcal (${totalProtein.toFixed(1)}g P / ${totalCarbs.toFixed(1)}g C / ${totalFats.toFixed(1)}g F)`;
    }).join('\n') || "No meals logged yet today.";

    console.log('[SUMMARY] Meals Summary:\n', mealsSummary);

    // --- 7. Profile summary ---
    const profileSummary = `
User: ${user.username} (${user.gender || 'Not specified'})
Age: ${user.age || 'Not specified'}, Weight: ${user.weight || 'Not specified'}kg, Height: ${user.height || 'Not specified'}cm
Activity Level: ${user.activityLevel || 'Not specified'}
Goal: ${goal.type}${goal.description ? ` - ${goal.description}` : ''}
Diet Type: ${preferences.dietType}
Allergies: ${preferences.allergies || 'None'}
Meal Frequency: ${preferences.mealFrequency} meals/day${preferences.snackIncluded ? ' (includes snacks)' : ''}
Profile Completed: ${user.profile_completed ? 'Yes' : 'No'}
    `.trim();
    console.log('[SUMMARY] Profile Summary:\n', profileSummary);

    // --- 8. Numeric targets (precompute and pass) ---
    const { calorieTarget, proteinTarget, tdee } = calculateTargets({
      weight: Number(user.weight),
      height: Number(user.height),
      age: Number(user.age),
      gender: user.gender,
      activityLevel: user.activityLevel,
      goalType: goal.type as string | null // Ensure goalType is compatible
    });
    console.log('[TARGETS] calorieTarget:', calorieTarget, 'proteinTarget:', proteinTarget, 'tdee:', tdee);
    // --- 10. Prompt (tight, with partial-data behavior baked in) ---
    const prompt = ChatPromptTemplate.fromTemplate(`
You are a helpful, personalized nutrition assistant for a mobile app. 
Keep responses SHORT, structured, and actionable — avoid unnecessary fluff.  

---  
USER PROFILE (context):
{profileSummary}

MEAL LOG (today):
{mealsSummary}

RECENT CHAT CONTEXT:
{shortTermMemory}

RELEVANT PAST CONVERSATIONS:
{vectorMemory}

USER’S QUESTION:
{input}

---  
RULES (STRICT):
1. Always prioritize USER PROFILE info (calorieTarget, proteinTarget, dietType, allergies, preferences).
2. MEAL LOGS (if available):
   - Use them for ANALYSIS or PROGRESS tracking.
   - If missing/empty → ignore them and still generate a valid answer.
3. NEVER invent profile details (like allergies or diet type).
4. Always return clear, concise, and structured answers.
5. Use bullet points, short paragraphs, and avoid unnecessary explanations.

---  
MODES:

**ANALYSIS MODE (Triggered by: "analyze", "how did I eat", "summary", "progress")**
- Summarize the meals logged today or over a given period.
- Compare intake vs targets (calories, protein, macros).
- Highlight progress, good habits, and areas to improve.
- Suggest small adjustments (e.g., “add protein at dinner”).

**PLANNING MODE (Triggered by: "plan", "diet", "tomorrow", "weekly", "monthly", "meal schedule")**
- Create structured meal plans (daily, tomorrow, weekly, monthly).
- Use calorie/protein targets + dietType + allergies + mealFrequency.
- If meal logs exist → reference them for continuity.
- If NO meals exist → still generate a full plan from profile info.
- Plans should hit calorie/protein goals and be realistic, simple, and varied.

---  
OUTPUT FORMAT (Plain Text Only):

- Begin with a short context line (e.g., "Here's your weekly plan..." or "Here's a dinner suggestion...")
- Structure the rest of the message into clear, emoji-labeled sections using only plain text.
- Use emojis for section headers:
  - 🥗 Meal Plan
  - 🎯 Targets
  - ✅ Quick Tips
- For each section, use simple hyphens (-) or bullets to list items.
- Do NOT use markdown formatting (no **bold**, no *, no _, no headers).
- Keep each section short, concise, and readable as-is in plain text.
- Include line breaks between sections.


      `);

    const chain = prompt.pipe(model);
    console.log('[LLM] Sending prompt to model...');
    const response = await chain.invoke({
      input: message,
      profileSummary,
      mealsSummary,
      shortTermMemory,
      vectorMemory,
      calorieTarget: String(calorieTarget),
      proteinTarget: String(proteinTarget)
    });
    const reply = response.content as string
    if (!reply) {
      console.error('[ERROR] No response generated from LLM');
      return res.status(500).json({ error: 'No response generated' });
    }

    // --- 11. Save messages ---
    console.log('[DB] Saving user and AI messages...');
    const [userMessage, aiMessage] = await Promise.all([
      prisma.message.create({ data: { conversationId: currentConversationId, senderRole: 'USER', content: message, metadata: { timestamp: new Date().toISOString() } } }),
      prisma.message.create({ data: { conversationId: currentConversationId, senderRole: 'AI', content: reply, metadata: { timestamp: new Date().toISOString(), model: 'nutrition-assistant', cached: false } } })
    ]);
    console.log('[DB] Messages saved. AI message ID:', aiMessage.id);

    await prisma.conversation.update({ where: { id: currentConversationId }, data: { updatedAt: new Date() } });

    // --- 12. Cache response ---
    console.log('[CACHE] Caching response...');
    await redis.set(cacheKey, reply, { EX: CACHE_TTL });

    // --- 13. Save to vector DB (non-blocking best-effort) ---
    (async () => {
      try {
        await saveChunksToVectorStore([
          new Document({
            pageContent: `User: ${message}\nAssistant: ${reply}`,
            metadata: {
              role: 'exchange',
              userId: userId.toString(),
              conversationId: currentConversationId,
              userMessageId: userMessage.id,
              aiMessageId: aiMessage.id,
              timestamp: new Date().toISOString()
            }
          })
        ], userId.toString());
        console.log('[VECTOR DB] Saved successfully');
      } catch (err) {
        console.warn('[VECTOR DB] Save failed (non-blocking):', err);
      }
    })();

    console.log('[SUCCESS] Sending final response...');
    return res.json({ reply, conversationId: currentConversationId, messageId: aiMessage.id, cached: false });

  } catch (err) {
    console.error('[ERROR] Recommend handler failed:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};




// Get user's single conversation messages
export const getConversationMessages = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get or create user's single conversation
    let conversation = await prisma.conversation.findUnique({
      where: { userId: Number(userId) },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            senderRole: true,
            content: true,
            createdAt: true,
            metadata: true
          }
        }
      }
    });

    if (!conversation) {
      // Create conversation if it doesn't exist
      conversation = await prisma.conversation.create({
        data: {
          userId: Number(userId),
          title: 'AI Nutrition Assistant'
        },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            select: {
              id: true,
              senderRole: true,
              content: true,
              createdAt: true,
              metadata: true
            }
          }
        }
      });
    }

    return res.json({ conversation });
  } catch (err) {
    console.error('Get conversation messages error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Clear user's conversation (delete all messages)
export const clearConversation = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { userId: Number(userId) }
    });

    if (conversation) {
      await prisma.message.deleteMany({
        where: { conversationId: conversation.id }
      });
    }

    return res.json({ message: 'Conversation cleared successfully' });
  } catch (err) {
    console.error('Clear conversation error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
