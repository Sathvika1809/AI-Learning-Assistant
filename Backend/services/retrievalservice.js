import { generateEmbedding } from "./embeddingservice.js";
import { searchDocumentChunks } from "./chromaService.js";

/**
 * Retrieve semantically relevant document chunks.
 *
 * Flow:
 * Question
 *   -> Gemini embedding
 *   -> ChromaDB vector similarity search
 *   -> Top-K relevant chunks
 *
 * IMPORTANT:
 * This is semantic/vector retrieval.
 * 
 *
 * @param {Object} params
 * @param {string} params.question - User's question
 * @param {string} params.documentId - MongoDB document ID
 * @param {string} params.userId - Authenticated user ID
 * @param {number} params.topK - Number of chunks to retrieve
 *
 * @returns {Promise<Array>}
 */
export const retrieveRelevantChunks = async ({
  question,
  documentId,
  userId,
  topK = 5,
}) => {
  try {
    if (!question || !question.trim()) {
      throw new Error("Question is required for semantic retrieval");
    }

    if (!documentId) {
      throw new Error("Document ID is required for semantic retrieval");
    }

    if (!userId) {
      throw new Error("User ID is required for semantic retrieval");
    }

    // ---------------------------------------------------------
    // STEP 1: Convert the user's question into an embedding
    // ---------------------------------------------------------
    const queryEmbedding = await generateEmbedding(question);

    if (!queryEmbedding || queryEmbedding.length === 0) {
      throw new Error("Failed to generate query embedding");
    }

    // ---------------------------------------------------------
    // STEP 2: Search ChromaDB using vector similarity
    // ---------------------------------------------------------
    const results = await searchDocumentChunks(
      queryEmbedding,
      documentId,
      userId,
      topK
    );

    // ---------------------------------------------------------
    // STEP 3: Convert ChromaDB's response into a clean format
    // ---------------------------------------------------------
    const documents = results?.documents?.[0] || [];
    const metadatas = results?.metadatas?.[0] || [];
    const distances = results?.distances?.[0] || [];

    const retrievedChunks = documents
      .map((content, index) => {
        const metadata = metadatas[index] || {};

        return {
          content,
          chunkIndex: metadata.chunkIndex,
          pageNumber: metadata.pageNumber,
          documentId: metadata.documentId,
          userId: metadata.userId,
          distance: distances[index] ?? null,
        };
      })
      .filter((chunk) => chunk.content);

    return retrievedChunks;
  } catch (error) {
    console.error("Semantic retrieval error:", error);
    throw error;
  }
};

export default retrieveRelevantChunks;