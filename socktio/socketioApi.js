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
    newSocketList= socketioApi.activeSockets.filter(e=>e.name!=newjs.name);
    socketioApi.activeSockets= [...newSocketList,{name:newjs.name,socketId:socket.id} ];
    console.log(socketioApi.activeSockets)
    socket.emit("update-user-list",{
      users:socketioApi.activeSockets,
      clientName:newjs.name
    }); 

    socket.broadcast.emit("update-user-list",{
      users:socketioApi.activeSockets,
    });
    }
  }

  
  socket.on("call-users", data => {
    console.log('callusers received');
    socket.broadcast.emit("call-made", {
      offer: data.offer,
      socket: socket.id,
      caller:data.caller
    });
  });


  socket.on("make-answer", data=>{
    console.log('make answer received')
    socket.to(data.to).emit("answer-made",{
      socket: socket.id,
      answer: data.answer,
      caller: data.caller
    });
  });



  socket.on("disconnect",()=>{
    console.log(socket.id);
  //   let socketUser = socketioApi.activeSockets.find(e=> e.socketId==socket.id);
  //  console.log(typeof(socketUser));
  //    let userName= socketUser["name"];
  //    console.log(userName);

    function removeUser(userList,sockId){
      return( 
        userList.filter(e => e["socketId"] !== sockId)
      )
    };
   socketioApi.activeSockets= removeUser(socketioApi["activeSockets"],socket.id);
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