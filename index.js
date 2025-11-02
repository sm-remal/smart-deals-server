// Import required packages
const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// ===================== MIDDLEWARE SETUP ===================== //
app.use(cors());              // Enable Cross-Origin Resource Sharing
app.use(express.json());      // Parse incoming JSON requests

// ===================== MONGODB CONNECTION ===================== //
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@clustersm.e6uuj86.mongodb.net/?appName=ClusterSM`;

// Create MongoDB client instance
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// Root route for testing server
app.get("/", (req, res) => {
    res.send("Simple Deals Server is going on");
})

// ================== MAIN FUNCTION ===================== //
async function run() {
    try {
        await client.connect(); // Connect to MongoDB

        // Define Database and Collections
        const Database = client.db("smart_db");
        const productsCollection = Database.collection("products");
        const bidsCollection = Database.collection("bids");
        const usersCollection = Database.collection("users");


        // ================= USERS RELATED API =================== //

        // POST: Add new user (if not already exists)
        app.post("/users", async (req, res) => {
            const newUsers = req.body;
            const email = req.body.email;
            const query = { email: email };
            const existingUser = await usersCollection.findOne(query);

            if (existingUser) {
                res.send({ message: "User already exist !!" });
            } else {
                const result = await usersCollection.insertOne(newUsers);
                res.send(result);
            }
        });



        // ===================== PRODUCTS RELATED API ==================== //

        // GET: Get all products or filter by user email
        app.get("/products", async (req, res) => {
            console.log(req.query);
            const email = req.query.email;
            const query = {};
            if (email) {
                query.email = email; // Filter products by email if provided
            }

            const cursor = productsCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        // GET: Get latest 6 products (sorted by creation date)
        app.get("/latest-products", async (req, res) => {
            const cursor = productsCollection.find().sort({ created_at: -1 }).limit(6);
            const result = await cursor.toArray();
            res.send(result);
        });

        // GET: Get a specific product by ID
        app.get("/products/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: id }; // new ObjectId(id) if stored as ObjectId
            const result = await productsCollection.findOne(query);
            res.send(result);
        });

        // POST: Add a new product
        app.post("/products", async (req, res) => {
            const newProduct = req.body;
            const result = await productsCollection.insertOne(newProduct);
            res.send(result);
        });

        // PATCH: Update product by ID (name, price)
        app.patch("/products/:id", async (req, res) => {
            const id = req.params.id;
            const updateProduct = req.body;
            const query = { _id: new ObjectId(id) };

            const update = {
                $set: {
                    name: updateProduct.name,
                    price: updateProduct.price,
                },
            };
            const options = {};
            const result = await productsCollection.updateOne(query, update, options);
            res.send(result);
        });

        // DELETE: Remove product by ID
        app.delete("/products/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await productsCollection.deleteOne(query);
            res.send(result);
        });



        // ==================== BIDS RELATED API ======================= //

        // GET: Get all bids or filter by user email
        app.get("/bids", async (req, res) => {
            console.log(req.query);
            const email = req.query.email;
            const query = {};
            if (email) {
                query.user_email = email; // Filter by user email
            }

            const cursor = bidsCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        // GET: Get all bids for a specific product (sorted by highest bid)
        app.get("/products/bids/:productId", async (req, res) => {
            const productId = req.params.productId;
            const query = { product: productId };
            const cursor = bidsCollection.find(query).sort({ bid_price: -1 });
            const result = await cursor.toArray();
            res.send(result);
        });

        // GET: Get all bids placed by a specific buyer (by email)
        app.get("/my-bids", async (req, res) => {
            const email = req.query.email;
            const query = {};
            if (email) {
                query.buyer_email = email; // Filter by buyer email
            }

            const cursor = bidsCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        // POST: Place a new bid
        app.post("/bids", async (req, res) => {
            const newBids = req.body;
            const result = await bidsCollection.insertOne(newBids);
            res.send(result);
        });


        // DELETE: Remove bids by ID
        app.delete("/bids/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await bidsCollection.deleteOne(query);
            res.send(result);
        });


        // Ping database to confirm connection success
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Keep connection open (do not close)
        // await client.close();
    }
}
run().catch(console.dir);

// ===================== SERVER LISTEN ===================== //
app.listen(port, () => {
    console.log(`Simple Deals Server at port: ${port}`)
});
