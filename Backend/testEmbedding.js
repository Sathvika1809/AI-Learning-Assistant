import { generateEmbedding } from "./services/embeddingservice.js";

const testEmbedding = async () => {
  try {
    const text =
      "A random variable maps outcomes in a sample space to numerical values.";

    const embedding = await generateEmbedding(text);

    console.log("Gemini embedding generated successfully!");
    console.log("Vector length:", embedding.length);
    console.log("First 10 values:", embedding.slice(0, 10));

  } catch (error) {
    console.error("Test failed:", error.message);
  }
};

testEmbedding();