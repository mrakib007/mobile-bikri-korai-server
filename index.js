// require('crypto').randomBytes(64).toString('hex')
//This line is for issuing a token

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
        const usersCollection = client.db('mobileBikriKorai').collection('usersCollection');
        const mobileCollection = client.db('mobileBikriKorai').collection('mobileCollection');
        const productCollection = client.db('mobileBikriKorai').collection('productCollection');
        app.get('/mobiles',async(req,res)=>{
          const query = {};
          const mobiles = await mobileCollection.find(query).toArray();
          res.send(mobiles);
        })
        app.post('/users', async (req, res) => {
            try {
              const userData = req.body;
              const filter = { email: userData?.email };
              const oldUser = await usersCollection.findOne(filter);
              if (!oldUser) {
                const result = await usersCollection.insertOne(userData);
                res.send(result);
              } else {
                res.status(400).json({ message: 'User already exists' });
              }
            } catch (error) {
              console.error(error);
              res.status(500).json({ message: 'Internal server error' });
            }
          });

          app.post('/products', async (req,res) =>{
            try{
              const products = req.body;
              const result = await productCollection.insertOne(products);
              res.send(result);
            }catch(error){
              res.status(500).json({message: 'Internal server error'});
            }
          })
          
          app.get('users',async(req,res) =>{
            const query = {};
            const users = await usersCollection.find(query).toArray();
            res.send(users);
          })
    }finally{
    }
}
run().catch(console.log)
app.get('/',async(req,res)=>{
    res.send('Mobile Bikri Korai server running');
})

app.listen(port,()=>console.log(`Mobile Bikri Korai running on ${port}`));
