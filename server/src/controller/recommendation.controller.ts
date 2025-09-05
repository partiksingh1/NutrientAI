// src/controllers/recommend.ts

import type { Request, Response } from 'express';
import { redis } from '../langchain/redisClient.js';
import prisma from '../db/prisma.js';
import { PromptTemplate } from '@langchain/core/prompts';
import { LLMChain } from 'langchain/chains';
import { model } from '../langchain/model/model.js';
import { Document } from '@langchain/core/documents';
import { getRelevantChatContext } from '../langchain/vector.js';
import { saveChunksToVectorStore } from '../langchain/storeVector.js';
import crypto from "crypto";

const MAX_CHAT_HISTORY = 5;
const CACHE_TTL = 60 * 10; // 10 min

export const recommend = async (req: Request, res: Response) => {
  try {
    const { userId, message } = req.body;
    if (!userId || !message?.trim()) {
      return res.status(400).json({ error: 'Missing userId or message' });
    }

    // --- 1. Semantic-friendly Cache Lookup ---
    const normalizedMessage = message.toLowerCase().replace(/\s+/g, ' ').trim();
    const hash = crypto.createHash('sha256').update(userId + normalizedMessage).digest('hex');
    const cacheKey = `cache:recommend:${hash}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json({ reply: cached, cached: true });
    }

    // --- 2. Fetch User Data (Optimized Select Fields) ---
    const now = new Date();
    const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
    const endOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

    const [user, goal, prefs, mealLogs] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, age: true, weight: true, height: true, activityLevel: true }
      }),
      prisma.goal.findFirst({
        where: { userId, isActive: true },
        orderBy: { startDate: 'desc' },
        select: { type: true }
      }),
      prisma.preferences.findUnique({
        where: { userId },
        select: { dietType: true, allergies: true }
      }),
      prisma.mealLog.findMany({
        where: {
          userId,
          mealDate: { gte: startOfToday, lte: endOfToday }
        },
        select: {
          servings: true, customName: true, mealType: true,
          calories: true, protein: true, carbs: true, fats: true
        }
      })
    ]);

    if (!user || !goal || !prefs) {
      return res.status(404).json({ error: 'User, goals, or preferences not found' });
    }

    // --- 3. Retrieve Recent Chat Memory (Structured) ---
    const redisChatKey = `chat:user:${userId}`;
    const recentChatsRaw = await redis.lRange(redisChatKey, -MAX_CHAT_HISTORY * 2, -1);
    const shortTermMemory = recentChatsRaw
      .map(msg => (typeof msg === 'string' ? msg : JSON.stringify(msg)))
      .join('\n');

    // --- 4. Retrieve Relevant Long-Term Memory ---
    const vectorResults = await getRelevantChatContext(message, 5);
    const vectorMemory = vectorResults.join('\n');

    // --- 5. Format Today's Meals (Compressed) ---
    const mealsSummary = mealLogs
      .slice(-3) // take latest 3 meals only
      .map(m => `- ${m.servings}× ${m.customName} in ${m.mealType}: ${m.calories} kcal (${m.protein}g P / ${m.carbs}g C / ${m.fats}g F)`)
      .join('\n') || "No meals logged yet.";

    // --- 6. Dynamic Profile Summary ---
    const profileSummary = `
Age: ${user.age}, Weight: ${user.weight}kg, Height: ${user.height}cm
Goal: ${goal.type || "Not specified"}, Activity: ${user.activityLevel}
Diet: ${prefs.dietType}, Allergies: ${prefs.allergies || "None"}
    `.trim();

    // --- 7. Prepare Contextual Prompt ---
    const promptTemplate = new PromptTemplate({
      template: `
    You are a helpful nutrition assistant.
    
    User Profile:
    {profile}
    
    Today's Meal Log:
    {meals}
    
    Recent Chats:
    \`\`\`json
    {shortTermMemory}
    \`\`\`
    
    Long-Term Memory:
    \`\`\`json
    {vectorMemory}
    \`\`\`
    
    User asks: {input}
    
    Give a clear, practical, and empathetic reply aligned with their goals.
      `.trim(),
      inputVariables: ['profile', 'meals', 'shortTermMemory', 'vectorMemory', 'input'],
    });

    // --- 8. LLM Call with Retry ---
    const chain = new LLMChain({ llm: model, prompt: promptTemplate });

    let reply: string | undefined;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const result = await chain.call({
          input: message,
          profile: profileSummary,
          meals: mealsSummary,
          shortTermMemory,
          vectorMemory
        });
        reply = result?.text?.trim();
        if (reply) break;
      } catch (e) {
        if (attempt === 1) throw e;
      }
    }

    if (!reply) {
      return res.status(500).json({ error: 'No response generated' });
    }

    // --- 9. Cache Response ---
    await redis.set(cacheKey, reply, { EX: CACHE_TTL });

    // --- 10. Update Short-Term Memory ---
    await redis.rPush(redisChatKey, JSON.stringify({ role: "user", content: message }));
    await redis.rPush(redisChatKey, JSON.stringify({ role: "assistant", content: reply }));
    await redis.lTrim(redisChatKey, -MAX_CHAT_HISTORY * 2, -1);

    // --- 11. Save to Long-Term Memory (Selective) ---
    if (message.length > 60) {
      await saveChunksToVectorStore([
        new Document({ pageContent: message, metadata: { role: "user", userId } }),
        new Document({ pageContent: reply, metadata: { role: "assistant", userId } })
      ], userId.toString());
    }

    return res.json({ reply, cached: false });

  } catch (err) {
    console.error('Recommendation error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
