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
await connectwithmongo(url); // ✅ Only allowed if your Node supports top-level await

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
    console.log("🔎 Received title:", title);

    if (!title) {
      return res.status(400).json({ error: "Title not provided" });
    }

    const result = await Relatedcollection.findOne({
      title: { $regex: `^${title}$`, $options: 'i' }
    });

    console.log("🧪 Query Result:", result);

    if (!result) {
      return res.status(404).json({ error: "No related question found" });
    }

    res.json(result);
  } catch (error) {
    console.error("❌ Error while fetching related questions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server is running on port ${PORT}`);
});