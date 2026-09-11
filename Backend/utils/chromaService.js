import chromaClient from "../config/chroma.js";

const COLLECTION_NAME = "documents";

export const getDocumentCollection = async () => {
  const collection = await chromaClient.getOrCreateCollection({
    name: COLLECTION_NAME,
  });

  return collection;
};