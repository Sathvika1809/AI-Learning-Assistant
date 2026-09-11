import { ChromaClient } from "chromadb";

const client = new ChromaClient({
  host: "localhost",
  port: 8000,
  ssl: false,
});

const COLLECTION_NAME = "document_chunks";

/**
 * Get or create the Chroma collection.
 *
 * We do NOT provide an embedding function because
 * embeddings are generated manually using Gemini.
 */
export const getDocumentCollection = async () => {
  try {
    const collection = await client.getOrCreateCollection({
      name: COLLECTION_NAME,
    });

    return collection;
  } catch (error) {
    console.error("Chroma collection error:", error);
    throw new Error("Failed to connect to ChromaDB");
  }
};


/**
 * Store document chunks and their Gemini embeddings.
 */
export const storeDocumentChunks = async (
  documentId,
  userId,
  chunks,
  embeddings
) => {
  try {
    const collection = await getDocumentCollection();

    const ids = chunks.map(
      (chunk) => `${documentId}_chunk_${chunk.chunkIndex}`
    );

    const documents = chunks.map((chunk) => chunk.content);

    const metadatas = chunks.map((chunk) => ({
      documentId: String(documentId),
      userId: String(userId),
      chunkIndex: Number(chunk.chunkIndex),
      pageNumber: Number(chunk.pageNumber || 0),
    }));

    await collection.upsert({
      ids,
      documents,
      embeddings,
      metadatas,
    });

    console.log(
      `Stored ${chunks.length} chunks for document ${documentId} in ChromaDB`
    );

    return true;

  } catch (error) {
    console.error("Chroma storage error:", error);
    throw error;
  }
};


/**
 * Search similar chunks using a Gemini query embedding.
 */
export const searchDocumentChunks = async (
  queryEmbedding,
  documentId,
  userId,
  maxResults = 5
) => {
  try {
    const collection = await getDocumentCollection();

    const results = await collection.query({
      queryEmbeddings: [queryEmbedding],

      nResults: maxResults,

      where: {
        $and: [
          { documentId: String(documentId) },
          { userId: String(userId) },
        ],
      },

      include: [
        "documents",
        "metadatas",
        "distances",
      ],
    });

    return results;

  } catch (error) {
    console.error("Chroma search error:", error);
    throw error;
  }
};


/**
 * Delete all vectors belonging to a document.
 */
export const deleteDocumentChunks = async (documentId) => {
  try {
    const collection = await getDocumentCollection();

    await collection.delete({
      where: {
        documentId: String(documentId),
      },
    });

    console.log(
      `Deleted vectors for document ${documentId}`
    );

  } catch (error) {
    console.error("Chroma delete error:", error);
    throw error;
  }
};