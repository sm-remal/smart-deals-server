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

        // Get
        app.get("/products", async(req, res) => {
            const cursor = productsCollection.find();
            const result = await cursor.toArray()
            res.send(result);
        })

        // Special Get
        app.get("/products/:id", async(req, res) => {
            const id = req.params.id;
            const query = {_id: new ObjectId(id)};
            const result = await productsCollection.findOne(query);
            res.send(result);
        })

        //Post
        app.post("/products", async(req, res) => {
            const newProduct = req.body;
            const result = await productsCollection.insertOne(newProduct);
            res.send(result)
        })

        // Patch
        app.patch("/products/:id", async(req, res) => {
            const id = req.params.id;
            const updateProduct = req.body;
            const query = {_id: new ObjectId(id)};
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
        app.delete("/products/:id", async(req, res) => {
            const id = req.params.id;
            const query = {_id: new ObjectId(id)};
            const result = await productsCollection.deleteOne(query);
            res.send(result);
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