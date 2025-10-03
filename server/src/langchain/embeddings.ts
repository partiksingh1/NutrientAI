import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

export const embeddings: any = (process.env.NODE_ENV === 'test')
  ? {
      embedQuery: async () => [0],
      embedDocuments: async () => [[0]],
    }
  : new GoogleGenerativeAIEmbeddings({
      model: "text-embedding-004", // 768 dimensions
      taskType: TaskType.RETRIEVAL_DOCUMENT,
      title: "langchain-vetors",
    });