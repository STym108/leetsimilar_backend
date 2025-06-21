import express from 'express'
import dotenv from 'dotenv'
dotenv.config();
import cors from 'cors'; // ✅ Add this
const app=express();
app.use(cors()); // ✅ Enable CORS

import cookieParser from 'cookie-parser'
import { connectwithmongo } from './connection.js';
import mongoose from 'mongoose';

app.use(express.json());
app.use(cookieParser());

const url=process.env.Mongo_url
connectwithmongo(url);

const Relatedschema=new mongoose.Schema({
    title:String,
    data:Object
})
const Relatedcollection=mongoose.model("RelatedQuestion",Relatedschema)
app.get('/', (req, res) => {
    res.send("LeetCode Similar Questions API is running.");
  });
app.get('/related',async (req,res)=>{
    try{
        const {title}=req.query;
        console.log("the received title is :",title);
        if(!title){
            return res.status(400).json({error:" try part , title is not found"});
        }
    const result=await Relatedcollection.findOne({title:new RegExp(`^${title}$`, "i")});
    if(!result){
        res.status(401).json({error:" No related question found"});
    }
    res.json(result );}
    catch(error){
        console.log("error while fetching related quesitons ",error);
        res.status(500).json({error: "server error "});
    }

});


app.listen(process.env.port|| 5001,()=>{
    console.log(`listening on the port ${process.env.port}....`)
})
