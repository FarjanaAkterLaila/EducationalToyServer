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
    const alltoyCollection = client.db('EduLerToy').collection('Alltoys');
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    
    
    const indexKeys = { name: 1 }; // Replace field1 and field2 with your actual field names
    const indexOptions = { name: "name" }; // Replace index_name with the desired index name
    const result = await alltoyCollection.createIndex(indexKeys, indexOptions);
    console.log(result);
    
    app.get("/search/:text", async (req, res) => {
      const stext = req.params.text;
      console.log(req.params.text)
      const result = await alltoyCollection
        .find({
        
        $or: [ {name: { $regex: stext, $options: "i" } }]
           
        
        })
        .toArray();
      res.send(result);
    });

    app.get('/alltoy', async (req, res) => {
      const cursor = alltoyCollection.find().limit(20);
      const result = await cursor.toArray();
      res.send(result);
  })

  app.get('/alltoy/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) }
    const result = await alltoyCollection.findOne(query);
    res.send(result);
})

    app.get('/post-toy', async (req, res) => {
      console.log(req.query.postedBy)
      let query = {};
      if (req.query?.postedBy) {
        query = { postedBy: req.query.postedBy}
    }
      const result = await toyCollection.find(query).toArray();
      res.send(result);
    })

    app.get('/post-toy/:cate', async(req,res)=>{
      
      console.log(req.params.cate)
      if(req.params.cate == "Engineering" || req.params.cate == "Science" || req.params.cate == "Language")
      {
        const result = await toyCollection.find({category : req.params.cate}).toArray();
        console.log(result);
        return res.send(result);
      }
      const result =await toyCollection.find({}).toArray();
      res.send(result);
      
    })
    app.get('/post-toy/:cate/:id', async(req, res) => {
      console.log(req.params.cate.id)
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await toyCollection.findOne(query);
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