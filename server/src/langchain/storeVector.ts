// src/langchain/vectorStore/saveToVectorStore.ts
import { v4 as uuidv4 } from 'uuid';
import { Document } from '@langchain/core/documents';
import { vectorStore } from './vector.js';

export async function saveChunksToVectorStore(
  chunks: Document[],
  sessionId: string
) {
  const chunksWithMetadata = chunks.map((chunk) => {
    const id = uuidv4();
    chunk.metadata = {
      ...chunk.metadata,
      sessionId,
      docId: id,
    };
    return chunk;
  });

  await vectorStore.addDocuments(chunksWithMetadata, {
    ids: chunksWithMetadata.map(c => c.metadata.docId)
  });
}
