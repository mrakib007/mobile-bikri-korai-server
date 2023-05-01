// require('crypto').randomBytes(64).toString('hex')
//This line is for issuing a token

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vbw8r.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req,res,next){
  const authHeader = req.headers.authorization;
  if(!authHeader){
    return res.status(401).send('unauthorized access');
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token,process.env.ACCESS_TOKEN,function(error,decoded){
    if(err){
      return res.status(403).send({message: 'forbidden access'})
    }
    req.decoded = decoded;
    next();
  })
}

async function run(){
    try{
        const usersCollection = client.db('mobileBikriKorai').collection('usersCollection');
        const mobileCollection = client.db('mobileBikriKorai').collection('mobileCollection');
        const productCollection = client.db('mobileBikriKorai').collection('productCollection');
        const bookingsCollection = client.db('mobileBikriKorai').collection('bookingsCollection');
        const paymentsCollection = client.db('mobileBikriKorai').collection('paymentsCollection');

        app.get('/mobiles',async(req,res)=>{
          const query = {};
          const mobiles = await mobileCollection.find(query).toArray();
          res.send(mobiles);
        })

        app.get('/products',async (req,res)=>{
          try{
            const query = {};
            const mobiles = await productCollection.find(query).toArray();
            res.send(mobiles);
          }catch(error){
            console.log(error);
            res.status(500).json({message:'Internal Server Error'});
          }
        })

        // app.get('/mobiles/:id',async(req,res)=>{
        //   try{
        //     const id = req.params._id;
        //     const filterProducts = await productCollection.find({id: id}).toArray();
        //     res.send(filterProducts);
        //   }catch(error){
        //     res.status(500).json({message:'Internal Server Error'});
        //   }
        // })
        app.get('/mobiles/:id',async(req,res)=>{
          try{
            const id = req.params.id;
            const filterProducts = await productCollection.find({ id: id }).toArray();
            res.send(filterProducts);
          }catch(error){
            res.status(500).json({message:'Internal Server Error'});
          }
        })

        //get bookings
        app.get('/bookings',verifyJWT,async(req,res)=>{
          const email = req.query.email;
          const decodedEmail = req.decoded.email;
          if(email !== decodedEmail){
            return res.status(403).send({message: 'forbidden access'});
          }
          const query = {email: email};
          const bookings = await bookingsCollection.find(query).toArray();
          res.send(bookings);
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

          //Get product
          app.get('/myProducts',async(req,res)=>{
            try{
              let query = {};
              if(req.query.email){
                query = {
                  email: req.query.email
                }
              }
              const cursor = productCollection.find(query);
              const products = await cursor.toArray();
              res.send(products);
            }catch(error){
              res.status(500).json({message: 'Internal server error'});
            }
          })

          app.patch('/myProducts/:id',async(req,res)=>{
            const id = req.params.id;
            const status = req.body.status;
            const query = {_id: new ObjectId(id)};
            const updatedDoc = {
              $set: {
                status: status
              }
            }
            const result = await productCollection.updateOne(query,updatedDoc);
            res.send(result);
          })

          app.post('/products', async (req,res) =>{
            try{
              const products = req.body;
              const result = await productCollection.insertOne(products);
              res.send(result);
            }catch(error){
              res.status(500).json({message: 'Internal server error'});
            }
          })
          
          app.get('/users',async(req,res) =>{
            const query = {};
            const users = await usersCollection.find(query).toArray();
            res.send(users);
          })

          app.get('/users/admin/:email',async(req,res)=>{
            try{
              const email = req.params.email;
              const query = {email};
              const user = await usersCollection.findOne(query);
              res.send({isAdmin: user?.role === 'admin'});
            }catch(error){
              res.status(500).json({message: 'Internal Server Error'});
            }
          })

          app.get('/users/seller/:email',async(req,res)=>{
            try{
              const email = req.params.email;
              const query = {email};
              const user = await usersCollection.findOne(query);
              res.send({isSeller: user?.role === 'seller'});
            }catch(error){
              res.status(500).json({message: 'Something went wrong'})
            }
          })

          app.get('/users/buyer/:email',async(req,res)=>{
            try{
              const email = req.params.email;
              const query = {email};
              const user = await usersCollection.findOne(query);
              res.send({isBuyer: user?.role === 'buyer'});
            }catch(error){
              res.status(500).json({message: 'Something went wrong'})
            }
          })

          app.delete('/products/:id',async(req,res)=>{
            const id = req.params.id;
            const query = {_id: new ObjectId(id)};
            const result = await productCollection.deleteOne(query);
            res.send(result);
          })

          app.delete('/users/:id',async(req,res)=>{
            const id = req.params.id;
            const filter = {_id: new ObjectId(id)};
            const result = await usersCollection.deleteOne(filter);
            res.send(result);
          })

          //book a product
          app.post('/bookings',async(req,res)=>{
            const booking = req.body;
            const result = await bookingsCollection.insertOne(booking);
            res.send(result);
          })

          //get products
          app.get('/myProducts',async(req,res)=>{
            try{
              let query = {};
              if(req.query.email){
                query = {
                  email: req.query.email
                }
              }
              const cursor = productCollection.find(query);
              const products = await cursor.toArray();
              res.send(products);
            }catch(error){
              res.status(500).json({message:'Internal Server Error'});
            }
          })
    }finally{
    }
}
run().catch(console.log)
app.get('/',async(req,res)=>{
    res.send('Mobile Bikri Korai server running');
})

app.listen(port,()=>console.log(`Mobile Bikri Korai running on ${port}`));
