const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

//MiddleWare
app.use(cors());
app.use(express.json());

// Connect MongoDB
const uri = "mongodb+srv://SimpleMDBUser:yHlnG6RFOEHEtoNa@clustersm.e6uuj86.mongodb.net/?appName=ClusterSM";

// Create Client
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

app.get("/", (req, res) => {
    res.send("Simple Deals Server is going on");
})

//Function
async function run() {
    try {
        await client.connect();

        // Create Collection
        const Database = client.db("smart_db");
        const productsCollection = Database.collection("products");
        const bidsCollection = Database.collection("bids");
        const usersCollection = Database.collection("users");


        // ============================= Users Related API ============================

        // Post
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
        })




        // ============================ Products Related API ===========================



        // Get
        app.get("/products", async (req, res) => {
            // const cursor = productsCollection.find().sort({price_min: 1}).skip(5).limit(3);

            // Query Parameter
            console.log(req.query)
            const email = req.query.email
            const query = {}
            if (email) {
                query.email = email
            }

            const cursor = productsCollection.find(query)
            const result = await cursor.toArray()
            res.send(result);
        })


        // Latest Products API
        app.get("/latest-products", async (req, res) => {
            const cursor = productsCollection.find().sort({ created_at: -1 }).limit(6);
            const result = await cursor.toArray();
            res.send(result);
        })


        // Special Get
        app.get("/products/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: id };   //new ObjectId(id)
            const result = await productsCollection.findOne(query);
            res.send(result);
        })

        //Post
        app.post("/products", async (req, res) => {
            const newProduct = req.body;
            const result = await productsCollection.insertOne(newProduct);
            res.send(result)
        })

        // Patch
        app.patch("/products/:id", async (req, res) => {
            const id = req.params.id;
            const updateProduct = req.body;
            const query = { _id: new ObjectId(id) };
            const update = {
                $set: {
                    name: updateProduct.name,
                    price: updateProduct.price
                }
            }
            const options = {};
            const result = await productsCollection.updateOne(query, update, options)
            res.send(result);
        })

        // Delete
        app.delete("/products/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await productsCollection.deleteOne(query);
            res.send(result);
        })


        // ======================== Bids Related API ============================


        app.get("/bids", async (req, res) => {

            // Query Parameter 
            console.log(req.query)
            const email = req.query.email
            const query = {}
            if (email) {
                query.user_email = email
            }

            const cursor = bidsCollection.find(query);
            const result = await cursor.toArray()
            res.send(result);
        })


        // Bids Get Buyer Info
        app.get("/products/bids/:productId", async (req, res) => {
            const productId = req.params.productId;
            const query = { product: productId };
            const cursor = bidsCollection.find(query).sort({ bid_price: -1 });
            const result = await cursor.toArray();
            res.send(result);
        });




        // Bids Post 
        app.post("/bids", async (req, res) => {
            const newBids = req.body;
            const result = await bidsCollection.insertOne(newBids);
            res.send(result)
        })






        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`Simple Deals Server at port: ${port}`)
})