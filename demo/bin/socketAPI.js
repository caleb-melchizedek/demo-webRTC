
let socketAPI = {
  func:function(io){
    io.on('connection', function(socket){
      console.log('socket achieved connection: '+socket);
    });
  }
    

  };
module.exports = socketAPI;