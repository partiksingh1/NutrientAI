import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import dotenv from 'dotenv'
dotenv.config()

// During tests, export a lightweight stub to avoid requiring API keys
export const model: any = (process.env.NODE_ENV === 'test')
  ? {
      // LLMChain uses `invoke` under the hood
      invoke: async () => ({ content: 'stubbed response' }),
      call: async () => ({ text: 'stubbed response' }),
    }
  : new ChatGoogleGenerativeAI({
      model: "gemini-2.0-flash",
      temperature: 0
    });