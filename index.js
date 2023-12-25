const express = require("express");
const cors = require("cors");

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 4000;

// middleware
app.use(cors());

app.use(express.json());

const client = new MongoClient(process.env.DATABASE_URL, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const taskCollection = client.db("protask").collection("tasks");

    app.get("/task/:email", async (req, res) => {
      const result = await taskCollection
        .find({ "user.email": req.params.email })
        .toArray();
      res.send(result);
    });

    app.get("/task/single/:id", async (req, res) => {
      const query = { _id: new ObjectId(req.params.id) };
      const result = await taskCollection.findOne(query);
      res.send(result);
    });

    app.post("/task", async (req, res) => {
      const newTask = req.body;
      const ress = await taskCollection.insertOne(newTask);
      const query = { _id: new ObjectId(ress.insertedId) };
      const result = await taskCollection.findOne(query);
      res.send(result);
    });

    app.put("/task/status/:id", async (req, res) => {
      const taskID = req.params.id;
      const newStatus = req.body;
      const update = { $set: { status: newStatus } };
      const result = await taskCollection.updateOne(
        { _id: new ObjectId(taskID) },
        update
      );
      res.send(result);
    });

    app.put("/task/:id", async (req, res) => {
      const taskID = req.params.id;
      const { title, description, deadline, priority, status } = req.body;
      const update = {
        $set: {
          title,
          description,
          deadline,
          priority,
          status,
        },
      };
      const result = await taskCollection.updateOne(
        { _id: new ObjectId(taskID) },
        update
      );
      res.send(result);
    });

    app.delete("/task/:id", async (req, res) => {
      const query = { _id: new ObjectId(req.params.id) };
      const result = await taskCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
