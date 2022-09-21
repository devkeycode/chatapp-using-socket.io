const express = require("express");
const app = express();
const path = require("path");

const { PORT } = require("./configs/server.config");
const server = app.listen(PORT, () => {
  console.log(`Server listening on PORT ${PORT}`);
});

app.use(express.static(path.join(__dirname, "public")));

//need to pass http server . to create a socket
const io = require("socket.io")(server);

let socketsConnected = new Set(); //each socket id is unique,so dont need to put same socketId connection more than once,using set
//listen for the event on the connection event on the websocket  server
io.on("connection", onConnection);

function onConnection(socket) {
  console.log(`Socket Connected ${socket.id}`);
  socketsConnected.add(socket.id);

  //whenver socket is connected, we need to emit a event to client mentioning size since total no of clients changed
  //io.emit('eventname',value)
  //form server side,emiiting an event , now the client side has to listne this event and act accordingly
  io.emit("clients-total", socketsConnected.size);

  //adding disconnect event on repsective socket conenction
  socket.on("disconnect", () => {
    console.log("Socket disconnected", socket.id);
    //remove socket id from the connectedSocketId
    socketsConnected.delete(socket.id);
    //io.emit will emit to each and every socket connected,including the socket conenction which causes this function to trigger
    io.emit("clients-total", socketsConnected.size);
  });

  //adding message event
  socket.on("message", (data) => {
    //emit the data to each client thats connected to web socket server, but not to client who send this
    //use broadcast.emit('eventname' ,data)
    socket.broadcast.emit("chat-message", data);
  });

  socket.on("feedback", (data) => {
    socket.broadcast.emit("feedback", data);
  });
}
