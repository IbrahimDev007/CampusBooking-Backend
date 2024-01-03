const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 3000;
//midleware
app.use(cors());
app.use(express.json());
//mongodb client here 
const { MongoClient, ServerApiVersion, ObjectId, aggregate } = require('mongodb');
const { Console } = require('console');
// const uri = `mongodb://127.0.0.1:27017`;
const uri = process.env.URI;



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
        // // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });

        const usersCollection = client.db("CollageCampus").collection("userDB");
        const collageCollection = client.db("CollageCampus").collection("collageDB");
        const popularCollection = client.db("CollageCampus").collection("popularDB");

        // api
        // ----------
        //all user see
        app.get('/users', async (req, res) => {
            const users = await usersCollection.find().toArray()
            res.send(users)
        })

        //user data added
        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email }
            const existingUser = await usersCollection.findOne(query);

            if (existingUser) {
                return res.send({ message: 'user already exists' })
            }

            const result = await usersCollection.insertOne(user);
            res.send(result);
        });
        //collage get 
        app.get('/collages', async (req, res) => {
            const collages = await collageCollection.find().toArray()
            res.send(collages)
        })
        //collage ata show by id
        app.get('/collage/:id', async (req, res) => {
            const Id = new ObjectId(req.params.id);

            try {
                const result = await collageCollection.findOne({ _id: Id });
                res.send(result)
            }
            catch (err) {
                res.send(err)
            }
        })
        // user info get
        app.get('/users/about/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email.toLowerCase() }
            const result = await usersCollection.findOne(query);
            res.send(result);
        })

        //user about updateDoc
        app.patch('/users/:id', async (req, res) => {
            const id = req.params.id;
            const Data = req.body;
            const filter = { _id: new ObjectId(id) };
            const updateDoc = { $set: Data };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.send(result);

        })

        app.patch('/review/:id', async (req, res) => {
            const id = req.params.id;
            const reviewAdd = await collageCollection.updateOne(
                { _id: new ObjectId(id) },
                { $push: { like: new ObjectId(userId) } }
            );
            res.send(reviewAdd);
        }
        )


        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);
app.get('/', (req, res) => {
    res.send('CampusBooking  IS RUNNING')
})

app.listen(port, () => {
    console.log(`CampusBooking  IS RUNNING ${port}`);
})