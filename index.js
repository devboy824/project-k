const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const PORT = 5000


app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://kuProject:3fl23fYIeEJ4bMGB@cluster0.fpfcy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// const uri = `mongodb+srv://uWJX0uRHs5pjK@cluster0.ls5ir.mongodb.net/?appName=Cluster0`;


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
        const usersCollection = client.db('ebayserver').collection('ebaystore');
        const cardCollection = client.db('ebayserver').collection('card');
        const trashCardCollection = client.db('ebayserver').collection('trashCard');
        const trashUserCollection = client.db('ebayserver').collection('trashUser');

        app.post("/user", async (req, res) => {
            const body = req.body;
            const now = new Date();
            const formattedDateTime = now.toLocaleDateString('en-US') + ' - ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            body.createdAt = formattedDateTime;
            
            const result = await usersCollection.insertOne(body);
            res.send(result);
        })

        app.post("/card", async (req, res) => {
            const body = req.body;
            const now = new Date();
            const formattedDateTime = now.toLocaleDateString('en-US') + ' - ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

            for (let item of body) {
                item.createdAt = formattedDateTime;
            }
            const result = await cardCollection.insertMany(body);
            res.send(result);
        })
        

        app.get("/card", async (req, res) => {
            const result = await cardCollection.find({}).toArray();
            // console.log(result);
            res.send(result)
        })

        app.get("/user", async (req, res) => {
            const result = await usersCollection.find({}).toArray();
            // console.log(result);
            res.send(result)
        })

        app.delete("/card/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
        
            // Find the document to be deleted
            const document = await cardCollection.findOne(query);
        
            if (document) {
                // Insert the document into the trash collection
                await trashCardCollection.insertOne(document);
        
                // Delete the document from the original collection
                const result = await cardCollection.deleteOne(query);
        
                res.send(result);
            } else {
                res.status(404).send({ message: "Document not found" });
            }
        });
        
        app.delete("/card/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
        
            // Find the document to be deleted
            const document = await usersCollection.findOne(query);
        
            if (document) {
                // Insert the document into the trash collection
                await trashUserCollection.insertOne(document);
        
                // Delete the document from the original collection
                const result = await usersCollection.deleteOne(query);
        
                res.send(result);
            } else {
                res.status(404).send({ message: "Document not found" });
            }
        });



        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get("/", (req, res) => {
    res.send("Welcome to the Ku server!")
})

// No route found 
app.all("*", (req, res) => {
    res.send("Route not found!");
})


app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
})