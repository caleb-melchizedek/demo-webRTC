var socket_io = require('socket.io');
let io = socket_io();

let newjs = require('../routes/new');

let socketioApi={
  io:io,
  activeSockets:[]
};

//socketioApi.io=io;

io.on('connection',(socket) =>{
  console.log(`socket connected${socket.id}`);
  module.exports=socket;

  const existingSocket=socketioApi.activeSockets.find(
    existingSocket=>existingSocket.socketId === socket.id 
  );

  if(!existingSocket){
    if(newjs.name){
    socketioApi.activeSockets.push({name:newjs.name,socketId:socket.id});
    console.log(socketioApi.activeSockets)
    socket.emit("update-user-list",{
      users:socketioApi.activeSockets,
      myId:socket.id
    }); 

    socket.broadcast.emit("update-user-list",{
      users:socketioApi.activeSockets,
    });
    // socket.emit("showMedia",{socketId:socket.id});
    // socket.broadcast.emit("showMedia",{socketId:socket.id});
    }
  }

  // socket.on("getMedia",()=>{
  //   socket.emit("showMedia",{
  //     socketId:socket.id
  //   });
  // });

  socket.on("call-users", data => {
    socket.broadcast.emit("call-made", {
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
    console.log(socket.id);
    let socketUser = socketioApi.activeSockets.find(e=> e.socketId==socket.id);
   console.log(typeof(socketUser));
     let userName= socketUser["name"];
     console.log(userName);

    function removeUser(userList,user){
      return( 
        userList.filter(e => e["name"] !== user)
      )
    };
   socketioApi.activeSockets= removeUser(socketioApi["activeSockets"],userName);
   console.log(socketioApi.activeSockets);

    // socket.broadcast.emit("remove-user",{
    //   socketId:socket.id
    // });

    socket.broadcast.emit("update-user-list",{
      users:socketioApi.activeSockets,
     });

  })

});

module.exports= socketioApi;