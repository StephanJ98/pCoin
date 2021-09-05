const cluster = require('cluster');
cluster.schedulingPolicy = cluster.SCHED_NONE;
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);

    // Fork workers.
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, _code, _signal) => {
        console.log(`Worker ${worker.process.pid} died. Starting another worker.`);
        cluster.fork();
    });
} else {
    const express = require("express");
    const app = express();
    const server = require('http').createServer(app);
    const io = require('socket.io')(server);
    require('dotenv').config()
    const cors = require('cors');
    const { MongoClient, ObjectID } = require('mongodb')
    const Blockchain = require('./Basic_BlockChain/Blockchain')
    let pCoinBlockChain = new Blockchain(1);

    /*  adding a block
        pCoinBlockChain.addNewBlock("Sua", "Test", 100)
    */

    var port = process.env.PORT || 4000;

    const mongodbOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
    let cachedDb = null

    async function connectToDatabase(uri) {
        if (cachedDb) {
            return cachedDb
        }
        const client = await MongoClient.connect(uri, mongodbOptions)
        const db = client.db(new URL(uri).pathname.substr(1))
        cachedDb = db
        return db
    }

    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    app.get("/", (_req, res) => {
        res.sendStatus(200)
    });

    app.get("/a", async (_req, res) => {
        try {
            const cluster = await connectToDatabase(process.env.MONGODB_URI_PCOIN)
            const collection = await cluster.collection('Users')
            const db = await collection.find({}).toArray()
            return res.json(db[0])
        } catch (e) {
            res.sendStatus(503)
            console.log(e)
        }
    });
/*
    app.get("/admin/edit", (_req, res) => {
        res.sendFile(`${__dirname}/edit.html`);
    });
    app.get("/admin/add", (_req, res) => {
        res.sendFile(`${__dirname}/add.html`);
    });*/

    /*app.get("/list/:id", async (req, res) => {
        try {
            const cluster = await connectToDatabase(process.env.MONGODB_URI)
            const collection = await cluster.collection('products')
            const db = await collection.find({ _id: ObjectID(req.params.id) }).toArray()
            return res.json(db[0])
        } catch (e) {
            res.sendStatus(503)
            console.log(e)
        }
    });*/

    /*app.post("/delete", async (req, res) => {
        let pass = req.body.pass

        try {
            const cluster = await connectToDatabase(process.env.MONGODB_URI)
            const collection = await cluster.collection('products')

            if (pass == process.env.PASS) {
                collection.deleteOne({ _id: ObjectID(req.body.id) })
                res.sendStatus(200)
            } else {
                res.sendStatus(403)
            }
        } catch (error) {
            res.sendStatus(503)
            console.log(error)
        }
    })

    app.post("/edit", async (req, res) => {
        let pass = req.body.pass
        try {
            const cluster = await connectToDatabase(process.env.MONGODB_URI)
            const collection = await cluster.collection('products')

            if (pass == process.env.PASS) {
                collection.updateOne({ _id: ObjectID(req.body.id) }, {
                    $set: {
                        title: req.body.title,
                        images: req.body.images.split(','),
                        rating: Number(req.body.rating),
                        description: req.body.description,
                        sport: req.body.sport,
                        store: req.body.store,
                        caracteristicas: {
                            peso: Number(req.body.peso),
                            talla: req.body.talla,
                            creador: req.body.creador
                        },
                        tags: req.body.tags.split(','),
                        link: req.body.link
                    }
                })

                res.sendStatus(200)
            } else {
                res.sendStatus(403)
            }
        } catch (error) {
            res.sendStatus(503)
            console.log(error)
        }
    })

    app.post("/add", async (req, res) => {
        let pass = req.body.pass
        try {
            const cluster = await connectToDatabase(process.env.MONGODB_URI)
            const collection = await cluster.collection('products')
            const db = await collection.find({}).toArray()

            if (pass == process.env.PASS) {
                collection.insertOne({
                    title: req.body.title,
                    images: req.body.images.split(','),
                    rating: Number(req.body.rating),
                    description: req.body.description,
                    sport: req.body.sport,
                    store: req.body.store,
                    caracteristicas: {
                        peso: Number(req.body.peso),
                        talla: req.body.talla,
                        creador: req.body.creador
                    },
                    tags: req.body.tags.split(','),
                    link: req.body.link
                })

                res.sendStatus(200)
            } else {
                res.sendStatus(403)
            }
        } catch (error) {
            res.sendStatus(503)
            console.log(error)
        }
    })*/

    server.listen(port, () => {
        console.log(`Worker ${process.pid} started on port: ${port}`);
    })
}