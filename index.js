const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server Is Running");
});

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.3azmgms.mongodb.net/?retryWrites=true&w=majority`;

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const productsCollection = client.db("brandShopDB").collection("products");
    const sliderCollection = client
      .db("brandShopDB")
      .collection("brand-slider");
    const cart = client.db("brandShopDB").collection("cart");

    // product related route
    app.get("/products/:brand", async (req, res) => {
      const brandName = req.params.brand;
      const query = { brandName: brandName };
      const cursor = productsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/products", async (req, res) => {
      const product = req.body;
      const result = await productsCollection.insertOne(product);
      res.send(result);
    });

    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productsCollection.findOne(query);
      res.send(result);
    });

    app.patch("/product/:id", async (req, res) => {
      const updatedProduct = req.body;
      const { photo, name, brandName, type, price, description, rating } =
        updatedProduct;
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const product = {
        $set: {
          photo, name, brandName, type, price, description, rating
        }
      }
      const result = await productsCollection.updateOne(filter, product);
      res.send(result)
      console.log(updatedProduct);
    });

    // cart related route
    app.post("/cart", async (req, res) => {
      const cartItem = req.body;
      const result = await cart.insertOne(cartItem);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server is running http://localhost:${port}`);
});
