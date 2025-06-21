


import mongoose from 'mongoose'

async function connectwithmongo(url){
try{
  await  mongoose.connect(url);
    console.log("Connecting to DB at: ", url);
    console.log("mongodb connected successfully with server....")
}
catch(err){
    console.log(err);
}
}
export{connectwithmongo}