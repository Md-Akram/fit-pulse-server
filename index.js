const express = require('express');
const cors = require('cors')
const app = express();
// const jwt = require('jsonwebtoken');
// const cookieParser = require('cookie-parser')
const port = process.env.PORT || 5000;
require('dotenv').config()


app.use(express.json())
app.use(cors())
// app.use(cookieParser())
// app.use(cors({
//     origin: ['http://localhost:5173', "https://hyper-market-67575.web.app", "https://hyper-market-67575.firebaseapp.com"],
//     credentials: true
// }))

// const verify = (req, res, next) => {
//     const token = req.cookies?.token
//     console.log("i am from very", req.cookies)
//     if (!token) {
//         return res.status(401).send({ status: 'Unauthorized Access', code: '401' })
//     }
//     jwt.verify(token, process.env.SECRET, (err, decoded) => {
//         if (err) {
//             return res.status(401).send({ status: 'Unauthorized Access', code: '401' })
//         }
//         console.log(decoded);
//         req.user = decoded
//         next()
//     })

// }


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hcdfjvb.mongodb.net/?retryWrites=true&w=majority`;

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
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        const database = client.db("fitPulseDB");
        const subscribersCollection = database.collection("subscribers");
        const trainersCollection = database.collection("trainers");
        const appliedCollection = database.collection('trainerApplications')
        const traineeAppliedCollection = database.collection('traineeApplications')
        const blogsCollection = database.collection('blogData')

        app.get('/trainers', async (req, res) => {
            const trainers = await trainersCollection.find().toArray()
            res.json(trainers);
        });

        app.get('/trainers/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(`${id}`) }
            const askedtrainer = await trainersCollection.findOne(query)
            res.send(askedtrainer)
        });

        app.get('/blogs', async (req, res) => {
            const blogs = await blogsCollection.find().toArray()
            res.json(blogs);
        });


        app.post('/apply', async (req, res) => {
            const trainerInfo = req.body
            console.log(trainerInfo);
            const result = await appliedCollection.insertOne(trainerInfo)

            res.send(result)
        })


        app.post('/traineeApply', async (req, res) => {
            const traineeInfo = req.body
            console.log(traineeInfo);
            const result = await traineeAppliedCollection.insertOne(traineeInfo)
            res.send(result)
        })



        app.put('/increaseBlogLike/:id', async (req, res) => {
            const { id } = req.params;
            const updatedBlog = req.body
            const filter = { _id: new ObjectId(`${id}`) }
            const options = { upsert: true }

            const updateBlog = {
                $set: {
                    ...updatedBlog
                }
            }

            const result = await blogsCollection.updateOne(filter, updateBlog, options)
            res.send(result)
        });

        app.delete('/deletejob/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(`${id}`) }
            const result = await jobsCollection.deleteOne(query)
            res.send(result)
        })

    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello, Express!');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
