const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dujofhq.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
   // await client.connect();

    const toyCollection = client.db('ToyAnimals').collection('theToys');

    app.post('/alltoys', async (req, res) => {
      const body = req.body;
      const result = await toyCollection.insertOne(body);
      res.send(result);
    });

    app.get('/alltoys', async (req, res) => {
      const cursor = toyCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get('/singleToys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.findOne(query);
      res.send(result);
    });

    app.delete('/singleToys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.deleteOne(query);
      res.send(result);
    });

    app.put('/singleToys/:id', async (req, res) => {
      const id = req.params.id;
      const user = req.body;

      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedUser = {
        $set: {
          img: user.img,
          name: user.name,
          seller: user.seller,
          subcategory: user.subcategory,
          price: user.price,
          quantity: user.quantity,
          email: user.email,
          rating: user.rating,
          details: user.details,
        },
      };
      const result = await toyCollection.updateOne(filter, updatedUser, options);
      res.send(result);
    });

    app.get('/alltoys/:text', async (req, res) => {
      if (req.params.text == 'teddy' || req.params.text == 'bird' || req.params.text == 'cat') {
        const result = await toyCollection.find({ subcategory: req.params.text }).toArray();
        return res.send(result);
      } else {
        const result = await toyCollection.find().toArray();
        return res.send(result);
      }
    });

    app.get('/singleToys', async (req, res) => {
      let query = {};
      if (req.query.email) {
        query = { email: req.query.email };
      }

      let sort = {};
      if (req.query.sort === 'price_asc') {
        sort = { price: 1 };
      } else if (req.query.sort === 'price_desc') {
        sort = { price: -1 };
      }

      const result = await toyCollection.find(query).sort(sort).toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
    console.log('Pinged your deployment. You successfully connected to MongoDB!');
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('port is running ');
});

app.listen(port, () => {
  console.log(`port is running on ${port}`);
});
