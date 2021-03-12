const express = require("express");
const mongoose = require("mongoose");
const cors=require('cors')
const Messages = require("./dbMessages");
const app = express();
const port = process.env.PORT || 9000;
const Pusher = require("pusher");
app.use(express.json());
app.use(cors())
const pusher = new Pusher({
  appId: "1170752",
  key: "540f6414ef95c11b39d8",
  secret: "1316b94e2df2fd6ab5f4",
  cluster: "ap2",
  useTLS: true,
});

const db = mongoose.connection;
db.once("open", () => {
  console.log("DB connected");
  const msgCollection = db.collection("messagecontents");
  const changeStream = msgCollection.watch();

  changeStream.on("change", (change) => {
    if (change.operationType === "insert") {
      const messageDetail = change.fullDocument;
      pusher.trigger("messages", "inserted", {
        name: messageDetail.name,
        message: messageDetail.message,
        timestamp:messageDetail.timestamp,
        received:messageDetail.received
      });
    } else {
      console.log("Error triggering pusher");
    }
  });
});
const connection_url =
  "mongodb+srv://whatsapp:Tbg4VyHmbflDOc8V@cluster0.ri7ah.mongodb.net/whatsappdb?retryWrites=true&w=majority";

mongoose.connect(connection_url, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
app.get("/", (req, res) => res.status(200).send("hello wasdgorld"));

app.get("/messages/sync", (req, res) => {
  Messages.find((err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});

app.post("/messages/new", (req, res) => {
  const dbMessage = req.body;
  Messages.create(dbMessage, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(`new message create:\n${data}`);
    }
  });
});

app.listen(port, () => {
  console.log(`listenning on localhost: ${port}`);
});
