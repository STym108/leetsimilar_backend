import { MongoClient } from "mongodb";
import questions from "./questionsData.js"; // assumes this is a JS file exporting an array

const uri = "mongodb+srv://shivam:shivam123@firstdb.z1gdx.mongodb.net/?retryWrites=true&w=majority&appName=FirstDB";
const client = new MongoClient(uri);

try {
  await client.connect();
  console.log("✅ Connected to MongoDB");

  const db = client.db("LeetSimilar");
  const collection = db.collection("Related_questions_collection");

  const result = await collection.insertMany(questions);
  console.log(`✅ Successfully inserted ${result.insertedCount} documents`);
} catch (error) {
  console.error("❌ Error inserting data:", error);
} finally {
  await client.close();
  console.log("🔌 Connection closed");
}