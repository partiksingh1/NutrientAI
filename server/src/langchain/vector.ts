import { NeonPostgres } from "@langchain/community/vectorstores/neon";
import { embeddings } from './embeddings.js';

export async function loadVectorStore() {
  return await NeonPostgres.initialize(embeddings, {
    connectionString: process.env.DATABASE_URL as string,
  });
}

// Define a similarity threshold (tune based on testing)
const SIMILARITY_THRESHOLD = 0.38;

export async function getRelevantChatContext(query: string, topK = 5): Promise<string[]> {
  // Retrieve topK candidates
  const results = await vectorStore.similaritySearchWithScore(query, topK);

  // Filter based on threshold
  const filtered = results.filter(([doc, score]) => score >= SIMILARITY_THRESHOLD);

  // Deduplicate by content (case-insensitive)
  const seen = new Set<string>();
  const unique = filtered
    .map(([doc]) => doc.pageContent.trim())
    .filter(content => {
      const lower = content.toLowerCase();
      if (seen.has(lower)) return false;
      seen.add(lower);
      return true;
    });

  return unique;
}

// Initialize vector store
export const vectorStore = await loadVectorStore();
