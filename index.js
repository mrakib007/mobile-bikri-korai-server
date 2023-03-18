const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');


const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vbw8r.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        const usersCollection = client.db('mobile-bikri-korai').collection('usersCollection');

        app.post('/users',async(req,res)=>{
            const userData = req.body;
            const filter = {email: userData?.email};
            const oldUser = await usersCollection.findOne(filter);
            if(!oldUser){
                const result = await usersCollection.insertOne(userData);
                res.send(result);
            }
        })
    }finally{
    }
}
app.get('/',async(req,res)=>{
    res.send('Mobile Bikri Korai server running');
})

app.listen(por,()=>console.log(`Mobile Bikri Korai running on ${port}`));
