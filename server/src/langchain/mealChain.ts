import type { Request, Response } from "express";
import { z } from "zod";
import { StructuredOutputParser } from "langchain/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { LLMChain } from "langchain/chains";
import { model } from "./model/model.js";
import { redis } from "./redisClient.js";
import prisma from "../db/prisma.js";
import type { Prisma } from "../../generated/prisma/index.js";

// Constants
const PARTIAL_PREFIX = "meal:partial:";
const PARTIAL_TTL_SECONDS = 60 * 10; // 10 minutes
const REQUIRED_FIELDS = ["mealType", "customName", "calories"] as const;

// Zod schema for meal data
export const mealZod = z.object({
  mealType: z.string().nullable().describe("breakfast | lunch | dinner | snack | PRE_WORKOUT | POST_WORKOUT | other"),
  customName: z.string().nullable().describe("name of the food"),
  calories: z.number().nullable(),
  protein: z.number().nullable(),
  carbs: z.number().nullable(),
  fats: z.number().nullable(),
  servings: z.number().nullable(),
  mealDate: z.string().nullable().optional().describe("ISO date or date/time string"),
  confidence: z
    .object({
      mealType: z.number().min(0).max(1).optional(),
      customName: z.number().min(0).max(1).optional(),
      calories: z.number().min(0).max(1).optional(),
    })
    .optional(),
});

export type MealData = z.infer<typeof mealZod>;
export const mealParser = StructuredOutputParser.fromZodSchema(mealZod);


// Clean LLM JSON output
const cleanLLMJson = (text: string): string => {
  return text
    .trim()
    .replace(/^```json/, "")
    .replace(/^```/, "")
    .replace(/```$/, "")
    .trim();
};

// LLM prompt for parsing meal text
const inferPrompt = new PromptTemplate({
  inputVariables: ["meal"],
  template: `
You are a nutritionist AI. Based on the meal description below, estimate nutritional values as accurately as possible and use standard USDA or common portion sizes and provide a confidence score (0 to 1) for each field. If the input is vague, prefer null values over guessing, and indicate low confidence.
- Extract the **customName** based on the meal description. It should be a short, meaningful name (e.g., "chicken salad", "toast with peanut butter", etc.). If the description is vague, return null.
- Do not guess the mealType and servings at all.
Meal description:
{meal}

Respond in strict JSON format:
{{
  "mealType": "breakfast" | "lunch" | "dinner" | "snack" | "other" | null,
  "customName": string | null,
  "calories": number | null,
  "protein": number | null,
  "carbs": number | null,
  "fats": number | null,
  "servings": number | null,
  "mealDate": string | null,
  "confidence": {{
    "mealType": number,
    "customName": number,
    "calories": number
  }}
}}
`.trim(),
});

// Parse meal text using LLM
export const parseMealText = async (userText: string): Promise<MealData> => {
  const chain = inferPrompt.pipe(model);
  try {
    const response = await chain.invoke({ meal: userText });
    const rawOutput = (response as any).text ?? (response as any).output_text ?? JSON.stringify(response);
    const llmOutput = cleanLLMJson(rawOutput);
    return await mealParser.parse(llmOutput);
  } catch (error) {
    console.error(`Failed to parse meal text: ${userText}`, error);
    return {
      mealType: null,
      customName: userText,
      calories: null,
      protein: null,
      carbs: null,
      fats: null,
      servings: null,
      mealDate: null,
      confidence: { mealType: 0, customName: 0.5, calories: 0 },
    };
  }
};

// Infer missing macros
export const inferMissingMacros = async (meal: {
  customName?: string | null;
  mealType?: string | null;
  servings?: number | null;
}): Promise<Partial<MealData>> => {
  const chain = new LLMChain({ llm: model, prompt: inferPrompt });
  const mealDesc = `${meal.customName ?? "unknown meal"} (${meal.mealType ?? "meal"}) x${meal.servings ?? 1}`;
  try {
    const res = await chain.call({ meal: mealDesc });
    const rawOutput = res.text ?? res.output_text ?? JSON.stringify(res);
    const llmOutput = cleanLLMJson(rawOutput);
    const inferred = JSON.parse(llmOutput);
    return {
      calories: inferred.calories ?? null,
      protein: inferred.protein ?? null,
      carbs: inferred.carbs ?? null,
      fats: inferred.fats ?? null,
      confidence: inferred.confidence ?? { mealType: 0, customName: 0, calories: 0 },
    };
  } catch (error) {
    console.error(`Failed to infer macros for: ${mealDesc}`, error);
    return {
      calories: null,
      protein: null,
      carbs: null,
      fats: null,
      confidence: { mealType: 0, customName: 0, calories: 0 },
    };
  }
};

// Load partial state from Redis
export const loadPartial = async (userId: string): Promise<MealData | null> => {
  try {
    const raw = await redis.get(PARTIAL_PREFIX + userId);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error(`Failed to load partial state for user ${userId}`, error);
    throw new Error("Failed to load partial state");
  }
};

// Merge partial data
export const mergePartial = (existing: MealData | null, parsed: MealData): MealData => {
  if (!existing) return parsed;
  return {
    mealType: parsed.mealType ?? existing.mealType,
    customName: parsed.customName ?? existing.customName,
    calories: parsed.calories ?? existing.calories,
    protein: parsed.protein ?? existing.protein,
    carbs: parsed.carbs ?? existing.carbs,
    fats: parsed.fats ?? existing.fats,
    servings: parsed.servings ?? existing.servings ?? 1,
    mealDate: parsed.mealDate ?? existing.mealDate ?? new Date().toISOString(),
    confidence: {
      mealType: parsed.confidence?.mealType ?? existing.confidence?.mealType ?? 0,
      customName: parsed.confidence?.customName ?? existing.confidence?.customName ?? 0,
      calories: parsed.confidence?.calories ?? existing.confidence?.calories ?? 0,
    },
  };
};

// // Check for missing required fields
// export const requiredFieldsMissing = (data: MealData): string[] => {
//   const missing: string[] = [];
//   if (!data.mealType && !data.customName) {
//     missing.push("customName_or_mealType");
//   }
//   if (!data.calories) {
//     missing.push("calories");
//   }
//   return missing;
// };

// Validate parsed data
export const validateParsedData = (data: MealData): string[] => {
  const issues: string[] = [];

  if (data.calories !== null && (data.calories < 10 || data.calories > 2000)) {
    issues.push("calories_unrealistic");
  }

  if (data.mealType && !["breakfast", "lunch", "dinner", "snack", "other"].includes(data.mealType)) {
    issues.push("mealType_invalid");
  }

  if (data.confidence?.mealType !== undefined && data.confidence.mealType < 0.5) {
    issues.push("mealType_low_confidence");
  }

  if (data.confidence?.calories !== undefined && data.confidence.calories < 0.5) {
    issues.push("calories_low_confidence");
  }

  if (data.servings !== null && (data.servings < 0 || data.servings > 10)) {
    issues.push("servings_unrealistic");
  }

  return issues;
};


export const generateFollowUpQuestion = async (
  data: MealData,
  issues: string[]
): Promise<string> => {
  const name = data.customName || "your meal";
  const type = data.mealType || "meal";

  // 1. Ask about meal type if it's missing or unclear
  if (issues.includes("mealType_invalid") || issues.includes("mealType_low_confidence")) {
    return `Was ${name} eaten as breakfast, lunch, dinner, a snack, or something else?`;
  }

  // 2. Ask about calories if unrealistic or low confidence
  if (issues.includes("calories_unrealistic")) {
    return `The calorie estimate (${data.calories} kcal) for ${name} seems off. Could you give a rough idea of how many calories it had?`;
  }

  if (issues.includes("calories_low_confidence")) {
    return `I'm not sure about the calories for ${name}. Can you share an estimate or more details about its size/ingredients?`;
  }

  // 3. Ask about servings if it seems unrealistic
  if (issues.includes("servings_unrealistic")) {
    return `You mentioned ${data.servings} servings for ${name}. Does that sound correct? How many servings did you actually have?`;
  }

  // 4. Generic fallback
  return `Could you share a bit more about ${name}, like portion size, ingredients, or preparation?`;
};

