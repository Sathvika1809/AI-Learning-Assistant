import chromaClient from "./config/chroma.js";
import { getDocumentCollection } from "./utils/chromaService.js";

const testChroma = async () => {
  try {
    // Test connection
    const heartbeat = await chromaClient.heartbeat();

    console.log("ChromaDB connected successfully!");
    console.log("Heartbeat:", heartbeat);

    // Create/get collection
    const collection = await getDocumentCollection();

    console.log("Collection created successfully!");
    console.log("Collection name:", collection.name);

  } catch (error) {
    console.error("ChromaDB error:", error);
  }
};

testChroma();