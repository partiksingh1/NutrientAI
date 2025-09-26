// src/controller/recommendation.controller.ts

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

interface RecommendationRequest {
  message: string;
}

interface RecommendationResponse {
  reply: string;
  conversationId: number;
  messageId: number;
  cached: boolean;
}

export const recommend = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { message }: RecommendationRequest = req.body;

    if (!userId || !message?.trim()) {
      return res.status(400).json({ error: 'Missing userId or message' });
    }

    // --- 1. Semantic-friendly Cache Lookup ---
    const normalizedMessage = message.toLowerCase().replace(/\s+/g, ' ').trim();
    const hash = crypto.createHash('sha256').update(userId + normalizedMessage).digest('hex');
    const cacheKey = `cache:recommend:${hash}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      // Get or create user's single conversation
      let conversation = await prisma.conversation.findUnique({
        where: { userId: Number(userId) }
      });

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            userId: Number(userId),
            title: 'AI Nutrition Assistant'
          }
        });
      }

      return res.json({
        reply: cached,
        conversationId: conversation.id,
        messageId: 0,
        cached: true
      });
    }

    // --- 2. Fetch User Data with Proper Relations ---
    const now = new Date();
    const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
    const endOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

    const [user, goal, preferences, mealLogs, recentConversations] = await Promise.all([
      prisma.user.findUnique({
        where: { id: Number(userId) },
        select: {
          id: true,
          username: true,
          age: true,
          weight: true,
          height: true,
          gender: true,
          activityLevel: true,
          profile_completed: true
        }
      }),
      prisma.goal.findFirst({
        where: { userId: Number(userId), isActive: true },
        orderBy: { startDate: 'desc' },
        select: {
          type: true,
          description: true,
          startDate: true,
          endDate: true
        }
      }),
      prisma.preferences.findUnique({
        where: { userId: Number(userId) },
        select: {
          dietType: true,
          allergies: true,
          mealFrequency: true,
          snackIncluded: true
        }
      }),
      prisma.mealLog.findMany({
        where: {
          userId: Number(userId),
          mealDate: { gte: startOfToday, lte: endOfToday }
        },
        select: {
          id: true,
          servings: true,
          customName: true,
          mealType: true,
          calories: true,
          protein: true,
          carbs: true,
          fats: true,
          notes: true,
          mealDate: true
        },
        orderBy: { mealDate: 'desc' }
      }),
      // Get recent conversations for context
      prisma.conversation.findMany({
        where: { userId: Number(userId) },
        orderBy: { updatedAt: 'desc' },
        take: 3,
        select: {
          id: true,
          title: true,
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
              senderRole: true,
              content: true,
              createdAt: true
            }
          }
        }
      })
    ]);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!goal) {
      return res.status(400).json({ error: 'No active goal found. Please set a dietary goal first.' });
    }

    if (!preferences) {
      return res.status(400).json({ error: 'User preferences not found. Please complete your profile first.' });
    }

    // --- 3. Get or Create User's Single Conversation ---
    let conversation = await prisma.conversation.findUnique({
      where: { userId: Number(userId) }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          userId: Number(userId),
          title: 'AI Nutrition Assistant'
        }
      });
    }

    const currentConversationId = conversation.id;

    // --- 4. Retrieve Recent Chat Memory from Database ---
    const recentMessages = await prisma.message.findMany({
      where: { conversationId: currentConversationId },
      orderBy: { createdAt: 'desc' },
      take: MAX_CHAT_HISTORY * 2,
      select: {
        senderRole: true,
        content: true,
        createdAt: true
      }
    });

    const shortTermMemory = recentMessages
      .reverse()
      .map(msg => `${msg.senderRole}: ${msg.content}`)
      .join('\n');

    // --- 5. Retrieve Relevant Long-Term Memory ---
    const vectorResults = await getRelevantChatContext(message, 5);
    const vectorMemory = vectorResults.join('\n');

    // --- 6. Format Today's Meals (Enhanced) ---
    const mealsByType = mealLogs.reduce((acc, meal) => {
      if (!acc[meal.mealType]) acc[meal.mealType] = [];
      acc[meal.mealType]!.push(meal);
      return acc;
    }, {} as Record<string, typeof mealLogs>);

    const mealsSummary = Object.entries(mealsByType)
      .map(([type, meals]) => {
        const totalCalories = meals.reduce((sum, m) => sum + (m.calories * m.servings), 0);
        const totalProtein = meals.reduce((sum, m) => sum + (m.protein * m.servings), 0);
        const totalCarbs = meals.reduce((sum, m) => sum + (m.carbs * m.servings), 0);
        const totalFats = meals.reduce((sum, m) => sum + (m.fats * m.servings), 0);

        return `${type}: ${meals.length} items, ${totalCalories.toFixed(0)} kcal (${totalProtein.toFixed(1)}g P / ${totalCarbs.toFixed(1)}g C / ${totalFats.toFixed(1)}g F)`;
      })
      .join('\n') || "No meals logged yet today.";

    // --- 7. Enhanced Profile Summary ---
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

    // --- 8. Prepare Enhanced Contextual Prompt ---
    const promptTemplate = new PromptTemplate({
      template: `
You are a helpful, personalized nutrition assistant for a mobile app. You have access to the user's complete profile, goals, preferences, and meal history.

User Profile:
{profile}

Today's Meal Log:
{meals}

Recent Conversation Context:
{shortTermMemory}

Relevant Past Conversations:
{vectorMemory}

User's Question: {input}

IMPORTANT GUIDELINES:
1. Be empathetic and supportive, understanding that nutrition is personal
2. Consider their specific goals, dietary restrictions, and preferences
3. Provide practical, actionable advice that fits their lifestyle
4. Reference their meal history when relevant
5. Suggest specific foods or meal ideas when appropriate
6. Be encouraging about their progress

FORMATTING RULES FOR MOBILE UI:
- Use simple, clean formatting that works well on mobile screens
- For lists, use numbered format (1. 2. 3.) or bullet points with dashes (-)
- Use line breaks (\\n) to separate different sections or ideas
- Keep paragraphs short and scannable (2-3 lines max)
- Use **bold** for emphasis on important points
- Avoid complex markdown syntax like tables or code blocks
- Make responses conversational and easy to read on a small screen
- Use emojis sparingly but effectively (🍎 🥗 💪 etc.)

Give a clear, practical, and empathetic reply aligned with their goals, formatted for mobile readability.
      `.trim(),
      inputVariables: ['profile', 'meals', 'shortTermMemory', 'vectorMemory', 'input'],
    });

    // --- 9. LLM Call with Retry ---
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
        console.error(`LLM attempt ${attempt + 1} failed:`, e);
        if (attempt === 1) throw e;
      }
    }

    if (!reply) {
      return res.status(500).json({ error: 'No response generated' });
    }

    // --- 10. Save Messages to Database ---
    const [userMessage, aiMessage] = await Promise.all([
      prisma.message.create({
        data: {
          conversationId: currentConversationId,
          senderRole: 'USER',
          content: message,
          metadata: { timestamp: new Date().toISOString() }
        }
      }),
      prisma.message.create({
        data: {
          conversationId: currentConversationId,
          senderRole: 'AI',
          content: reply,
          metadata: {
            timestamp: new Date().toISOString(),
            model: 'nutrition-assistant',
            cached: false
          }
        }
      })
    ]);

    // --- 11. Update Conversation Timestamp ---
    await prisma.conversation.update({
      where: { id: currentConversationId },
      data: { updatedAt: new Date() }
    });

    // --- 12. Cache Response ---
    await redis.set(cacheKey, reply, { EX: CACHE_TTL });

    // --- 13. Save to Long-Term Memory (Selective) ---
    if (message.length > 60 && reply.length > 60) {
      await saveChunksToVectorStore([
        new Document({
          pageContent: `User: ${message}`,
          metadata: {
            role: "user",
            userId: userId.toString(),
            conversationId: currentConversationId,
            timestamp: new Date().toISOString()
          }
        }),
        new Document({
          pageContent: `Assistant: ${reply}`,
          metadata: {
            role: "assistant",
            userId: userId.toString(),
            conversationId: currentConversationId,
            timestamp: new Date().toISOString()
          }
        })
      ], userId.toString());
    }

    const response: RecommendationResponse = {
      reply,
      conversationId: currentConversationId,
      messageId: aiMessage.id,
      cached: false
    };

    return res.json(response);

  } catch (err) {
    console.error('Recommendation error:', err);
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
