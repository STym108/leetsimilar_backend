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
connectwithmongo(url);

// Schema and Model
const Relatedschema = new mongoose.Schema({
  title: String,
  data: Object
});
const Relatedcollection = mongoose.model(
    "RelatedQuestion",
    Relatedschema,
    "Related_questions_collection"
  );
// Test route
app.get('/', (req, res) => {
  res.send("LeetCode Similar Questions API is running.");
});

// API route to get related questions
app.get('/related', async (req, res) => {
    try {
      const { title } = req.query;
      console.log("🔎 Received title:", title);
  
      if (!title) {
        return res.status(400).json({ error: "Title not provided" });
      }
  
      const result = await Relatedcollection.findOne({ title: new RegExp(`^${title}$`, "i") });
  
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