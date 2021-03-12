import "./App.css";
import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Chat from "./chat";
import "./App.css";
import Pusher from "pusher-js";
import axios from "./axios";

function App() {
  const [messages, setMessages] = useState([]);
  useEffect(() => {
    axios
      .get("/messages/sync")
      .then((response) => {
        setMessages(response.data);
      })
      .catch((error) => console.log(error));
  }, []);
  useEffect(() => {
    const pusher = new Pusher("540f6414ef95c11b39d8", {
      cluster: "ap2",
    });
    const channel = pusher.subscribe("messages");
    channel.bind("inserted", function (newMessage) {
      setMessages([...messages, newMessage]);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [messages]);
  console.log("messages", messages);
  return (
    <div className="app">
      <div className="app__body">
        <Sidebar />
        <Chat messages={messages} />
      </div>
    </div>
  );
}

export default App;
