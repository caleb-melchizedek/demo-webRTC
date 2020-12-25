var socket_io = require('socket.io');
let io = socket_io();

let socketioApi={
  io:io,
  activeSockets:[]
};

//socketioApi.io=io;

io.on('connection',(socket) =>{
  console.log(`socket connected${socket.id}`);
    

  const existingSocket=socketioApi.activeSockets.find(
    existingSocket=>existingSocket === socket.id 
  );

  if(!existingSocket){
    socketioApi.activeSockets.push(socket.id);

    socket.emit("update-user-list",{
      users: socketioApi.activeSockets.filter(
        existingSocket=>existingSocket !== socket.id
      ),
      myId:socket.id
    });

    socket.broadcast.emit("update-user-list",{
      users:[socket.id],
      myId:socket.id
    });

  }

  socket.on("call-user", data => {
    socket.to(data.to).emit("call-made", {
      offer: data.offer,
      socket: socket.id
    });
  });


  socket.on("make-answer", data=>{
    socket.to(data.to).emit("answer-made",{
      socket: socket.id,
      answer: data.answer
    });
  });



  socket.on("disconnect",()=>{
    socketioApi.activeSockets = socketioApi.activeSockets.filter(
      existingSocket=> existingSocket !== socket.id
    );
    socket.broadcast.emit("remove-user",{
      socketId:socket.id
    });

  });

});


module.exports= socketioApi;