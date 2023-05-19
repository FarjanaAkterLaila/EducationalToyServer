const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
// middleware
app.use(cors());
app.use(express.json());


console.log(process.env.DB_Password)
const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Password}@cluster0.zmwk4eu.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    const toyCollection = client.db('EduLerToy').collection('Toys');
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    app.get('/post-toy', async (req, res) => {
      console.log(req.query.postedBy)
      let query = {};
      if (req.query?.postedBy) {
        query = { postedBy: req.query.postedBy}
    }
      const result = await toyCollection.find(query).toArray();
      res.send(result);
    })
    app.post("/post-toy", async (req, res) => {
      const body = req.body;
      const result = await toyCollection.insertOne(body);
      console.log(result);
      res.send(result);
      //  if (result?.insertedId) {
      //   return res.status(200).send(result);
      // } else {
      //   return res.status(404).send({
      //     message: "Try again leter",
      //     status: false,
      //   });
      // }
    });

    app.get('/post-toy/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await toyCollection.findOne(query);
      res.send(result);
  })
  app.patch('/post-toy/:id', async(req, res) => {
    const id = req.params.id;
    const filter = {_id: new ObjectId(id)}
    const options = { upsert: true };
    const updatedtoy = req.body;

    const toys = {
        $set: {
         
            name: updatedtoy.name, 
            sellername: updatedtoy.sellername, 
            category: updatedtoy.category, 
            price: updatedtoy.price, 
            quantity: updatedtoy.quantity, 
            image: updatedtoy.image, 
            description: updatedtoy.description
        }
    }

    const result = await toyCollection.updateOne(filter, toys, options);
    res.send(result);
})

  app.delete('/post-toy/:id', async(req,res)=>{
    const id =req.params.id;
    const query ={
      _id : new ObjectId(id)

    }
    const result = await toyCollection.deleteOne(query)
    res.send(result)
  })
   
    // app.get("/allToys", async(req, res) => {
    //   const result = await toyCollection.find({}).toArray();
    //   res.send(result);
    // });

    //   app.delete('/myToys/:id', async (req, res) => {
    //     const id = req.params.id;
    //     const query = { _id: new ObjectId(id) }
    //     const result = await toyCollection.deleteOne(query);
    //     res.send(result);
    // })


  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('doctor is running')
})

app.listen(port, () => {
  console.log(`Car Doctor Server is running on port ${port}`)
})