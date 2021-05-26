// require('md-gum-polyfill');

//const port = normalizePort(process.env.PORT || '3000');
// if (navigator.mediaDevices === undefined) {
//   navigator.mediaDevices = {};
// }


// if (navigator.mediaDevices.getUserMedia === undefined) {
//   navigator.mediaDevices.getUserMedia = function(constraints) {

//     // First get ahold of the legacy getUserMedia, if present
//     var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

//     // Some browsers just don't implement it - return a rejected promise with an error
//     // to keep a consistent interface
//     if (!getUserMedia) {
//       return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
//     }

//     // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
//     return new Promise(function(resolve, reject) {
//       getUserMedia.call(navigator, constraints, resolve, reject);
//     });
//   }
// }

window.addEventListener('load',()=>{


  const socket =io();

  const { RTCPeerConnection, RTCSessionDescription } = window;
  const peerConnection= new RTCPeerConnection;

  // user identifiers
  var myName;
  var mySocketId;

  // default media constraints
  const mediaCheck={
    audio:false,
    video:false
  };
  //media constraints
  var constraints={
    audio:true,
    video:true
  };

//capture local media

  function getMedia(socketId){

    navigator.mediaDevices.getUserMedia(constraints)
    .then(
      stream => {
        window.stream = stream;

        if(mediaCheck.audio==true && mediaCheck.video==true){
          stream.getTracks().forEach(function(track){
            console.log(track);
          })
        }
        else if(mediaCheck.audio==false && mediaCheck.video==true){
          // stop only mic
          stream.getTracks().forEach(function(track) {
              if (track.readyState == 'live' && track.kind === 'audio') {
                  track.stop();
                  // track.enabled=false;
              }
              console.log(track);
          });
        }
        else if(mediaCheck.audio==true && mediaCheck.video==false){
          // stop only camera
            stream.getTracks().forEach(function(track) {
                if (track.readyState == 'live' && track.kind === 'video') {
                    track.stop();
                    // track.enabled=false;
                }
                console.log(track);
            });
        }
        else if(mediaCheck.audio==false && mediaCheck.video==false){
          // stop both camera and mic
            stream.getTracks().forEach(function(track) {
                if (track.readyState == 'live') {
                    track.stop();
                    track.enabled=false;
                }
                console.log(track);
            });
        }
        
    

        const localVideo = document.getElementById(`${myName}`).firstChild;
        console.log(localVideo);
        if (localVideo) { 
          localVideo.muted=true;
          if ("srcObject" in localVideo) {
            localVideo.srcObject = stream;
          } else {
            // Avoid using this in new browsers, as it is going away.
            localVideo.src = window.URL.createObjectURL(stream);
          }
        };
        stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
      }
    ).catch(
      error => {console.warn(error.message) }
    );;
  }


  //socket operations

  socket.on("update-user-list", ({ users,clientName }) => {
    console.log(users);
    updateUserList(users);
    if (clientName) myName= clientName;
    console.log(users);
    mysocketId = users.find(e=>e.name=myName).socketId;
    console.log("Your socket Id is"+mysocketId+ ": and you are "+ myName);
    getMedia(mySocketId);
  });

  socket.on("remove-user", ({ socketId }) => {
    const elToRemove = document.getElementById(socketId);
    if (elToRemove) {
      elToRemove.remove();
    }
  });

  //functions

  //toggle video
  let videoBtn=document.getElementById("videoBtn");
  videoBtn.addEventListener("click",
    function(){    
      mediaCheck.video= !mediaCheck.video 
      console.log(mediaCheck)
      getMedia(mySocketId);
    }
  );
  //toggle audio
  let micBtn=document.getElementById("micBtn");
  micBtn.addEventListener( "click",
    function(){ 
      mediaCheck.audio= !mediaCheck.audio 
      console.log(mediaCheck)
      getMedia(mySocketId);
    }
  );

  function updateUserList(users) {
    //otherS
    console.log(users);
    const activeUserContainer = document.getElementById("smallVideosWrapper")

    while (activeUserContainer.firstChild) {
      activeUserContainer.removeChild(activeUserContainer.firstChild);
    }
    console.log("vids removed for replacement");
    users.forEach(user => { 
      const alreadyExistingUser = document.getElementById(user.name);
      if (!alreadyExistingUser) {
        const userContainerEl = createUserItemContainer(user.socketId, user.name);
        activeUserContainer.appendChild(userContainerEl); 
      }
    });
    console.log("User list was just updated");
  }

  function createUserItemContainer(socketId, name) {
    var inits="";
    let a =name.split(" ",2);
    a.forEach(function(b){
      inits=inits+b[0].toUpperCase();
    });

    console.log(inits);
    const smallVideoWrapper = document.createElement("div");
    const smallVideo = document.createElement("video");

    smallVideoWrapper.setAttribute("class", "wrapper");
    smallVideoWrapper.setAttribute("id",name );
    smallVideoWrapper.setAttribute("data-initials",inits);
  
    smallVideo.setAttribute("id",socketId);
    smallVideo.setAttribute("autoplay","true");
    
    

    

    smallVideoWrapper.appendChild(smallVideo);
    
    smallVideo.addEventListener("click", 
      () => {
        callUsers();
        console.log('calling users');
      }
    ); 
    return smallVideoWrapper;
  }


  //RTC functions

  async function callUsers() {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(new RTCSessionDescription(offer));
    console.log('callusers fired');
    socket.emit("call-users", {
      offer,
      caller:myName
    });
  } 
  
  socket.on("call-made", async data => {
    console.log('call made received')
    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(data.offer)
    );
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(new RTCSessionDescription(answer));
    
    socket.emit("make-answer", {
      answer,
      to: data.socket,
      caller: data.caller
    });
    console.log('make answer fired')
  });


  socket.on("answer-made", async data=>{
    console.log('call made received')
    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(data.answer)
    );
    
    peerConnection.ontrack = function({ streams:[stream] }) {
      const remoteStream= new MediaStream();
      remoteStream.addTrack(event.track ,stream);
      const remoteVideo = document.getElementById(data.caller).firstChild;
      if (remoteVideo) {
        remoteVideo.srcObject =remoteStream;
      }
    }
  });

  ; 
})