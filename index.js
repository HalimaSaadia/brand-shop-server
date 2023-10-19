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

const faqs = [
  {
    question: "What is your return policy for defective items?",
    answer:
      "Contact our customer service within 30 days for a replacement or refund.",
  },
  {
    question: "How do I track my order?",
    answer:
      "You'll receive an email with the tracking number. It's also in your account.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept credit/debit cards, PayPal, and other secure options.",
  },
  {
    question: "Can I change or cancel my order after placing it?",
    answer:
      "Orders are processed immediately, so changes or cancellations aren't possible.",
  },

  {
    question: "What is the warranty on your products?",
    answer:
      "Most products have a 1-year manufacturer's warranty. Check the product listing for details.",
  },
 
];

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const productsCollection = client.db("brandShopDB").collection("products");
    const sliderCollection = client.db("brandShopDB").collection("brand-slider");
    const cart = client.db("brandShopDB").collection("cart");
    const faq = client.db("brandShopDB").collection("faq");

 

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
          photo,
          name,
          brandName,
          type,
          price,
          description,
          rating,
        },
      };
      const result = await productsCollection.updateOne(filter, product);
      res.send(result);
      console.log(updatedProduct);
    });

    // cart related route
    app.get("/cart", async (req, res) => {
      const cursor = cart.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.delete("/cart/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cart.deleteOne(query);
      res.send(result);
    });

    app.post("/cart", async (req, res) => {
      const cartItem = req.body;
      const result = await cart.insertOne(cartItem);
      res.send(result);
    });

    // faq related Route
    app.get("/faq", async (req, res) => {
      const cursor = faq.find();
      const result = await cursor.toArray();
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
