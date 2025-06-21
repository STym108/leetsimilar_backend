import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { connectwithmongo } from './connection.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB
const url = process.env.MONGO_URL;

try {
  // 1. Force new connection and disable caching
  await mongoose.connect(url, {
    dbName: "LeetSimilar", // 👈 Hardcode your DB name to avoid ambiguity
    serverSelectionTimeoutMS: 5000, // Fail fast if no connection
  });

  // 2. Verify connection details
  console.log("✅ Connected to MongoDB:");
  console.log("- Host:", mongoose.connection.host);
  console.log("- Database:", mongoose.connection.db.databaseName); // Should log "LeetSimilar"

  // 3. List ALL collections in the connected DB
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log("- Collections:", collections.map(c => c.name)); 
  // Should include "Related_questions_collection"

  // 4. Directly query the collection (bypass Mongoose models)
  const testDoc = await mongoose.connection.db
    .collection("Related_questions_collection")
    .findOne({ title: "Two Sum" });
  
  console.log("- Test document:", testDoc); // Should log your "Two Sum" doc
} catch (err) {
  console.error("❌ MongoDB connection error:", err.message);
  process.exit(1); // Crash the app if DB fails
}
// ✅ Only allowed if your Node supports top-level await

// Schema and Model
const Relatedschema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  data: {
    GeeksforGeeks: String,
    CSES: String,
    Codeforces: String,
  },
});
const Relatedcollection = mongoose.model(
  "RelatedQuestion",
  Relatedschema,
  "Related_questions_collection"
);

// Debug: log all titles in DB at startup
Relatedcollection.find({}).then(allDocs => {
  allDocs.forEach(doc =>
    console.log("📝 Title in DB:", `"${doc.title}"`)
  );
});

// Test route
app.get('/', (req, res) => {
  res.send("LeetCode Similar Questions API is running.");
});

app.get('/all', async (req, res) => {
  const all = await Relatedcollection.find({});
  res.json(all);
});

// Main API
app.get('/related', async (req, res) => {
    try {
      const title = req.query.title?.trim();
      console.log("🔍 Raw Title from URL:", title); // Debug the exact input
  
      // 1. Check if title exists
      if (!title) {
        return res.status(400).json({ error: "Title parameter is missing" });
      }
  
      // 2. Debug: List all titles in DB
      const allTitles = await Relatedcollection.distinct("title");
      console.log("📚 All titles in DB:", allTitles);
  
      // 3. Query with case-insensitive exact match
      const result = await Relatedcollection.findOne({
        title: { $regex: `^${title}$`, $options: "i" }
      });
  
      if (!result) {
        return res.status(404).json({ 
          error: "No matching question found",
          searchedTitle: title,
          availableTitles: allTitles // Help the caller debug
        });
      }
  
      res.json(result);
    } catch (error) {
      console.error("❌ Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server is running on port ${PORT}`);
});