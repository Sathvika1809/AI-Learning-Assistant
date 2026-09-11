import {
  generateEmbeddings,
  generateEmbedding,
} from "./services/embeddingservice.js";

import {
  storeDocumentChunks,
  searchDocumentChunks,
} from "./services/chromaService.js";


const test = async () => {
  try {
    const documentId = "test-document-001";
    const userId = "test-user-001";

    const chunks = [
      {
        content:
          "A random variable is a function that maps outcomes of a sample space to numerical values.",
        chunkIndex: 0,
        pageNumber: 1,
      },
      {
        content:
          "Probability measures how likely an event is to occur and ranges from zero to one.",
        chunkIndex: 1,
        pageNumber: 2,
      },
      {
        content:
          "A probability distribution describes the probabilities associated with possible values of a random variable.",
        chunkIndex: 2,
        pageNumber: 3,
      },
    ];


    // STEP 1: Generate embeddings
    const texts = chunks.map((chunk) => chunk.content);

    console.log("Generating embeddings...");

    const embeddings = await generateEmbeddings(texts);

    console.log(
      "Embeddings generated:",
      embeddings.length
    );


    // STEP 2: Store in Chroma
    console.log("Storing in ChromaDB...");

    await storeDocumentChunks(
      documentId,
      userId,
      chunks,
      embeddings
    );


    // STEP 3: Generate embedding for query
    const question =
      "What is a random variable?";

    console.log("\nSearching for:", question);

    const queryEmbedding =
      await generateEmbedding(question);


    // STEP 4: Search Chroma
    const results =
      await searchDocumentChunks(
        queryEmbedding,
        documentId,
        userId,
        3
      );


    console.log(
      "\nSearch Results:"
    );

    console.log(
      JSON.stringify(results, null, 2)
    );

  } catch (error) {
    console.error(
      "TEST FAILED:",
      error
    );
  }
};


test();