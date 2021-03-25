
//const port = normalizePort(process.env.PORT || '3000');
const socket =io();

const { RTCPeerConnection, RTCSessionDescription } = window;
const peerConnection= new RTCPeerConnection;

//capture local media

const mediaCheck={
  audio:false,
  video:false
};
var constraints={
  audio:true,
  video:true
};

var mySocketId;

function getMedia(socketId){

  //check for mediadevices
  if (navigator.mediaDevices === undefined) {
    navigator.mediaDevices = {};
  }
  // For browsers with partial implementation mediaDevices. 
  if (navigator.mediaDevices.getUserMedia === undefined) {
    navigator.mediaDevices.getUserMedia = function(constraints) {

      // First get legacy getUserMedia, if present
      var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

      // Return a rejected promise with an error for browsers that don't implement it
      if (!getUserMedia) {
        return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
      }

      // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
      return new Promise(function(resolve, reject) {
        getUserMedia.call(navigator, constraints, resolve, reject);
      });
    }
  }


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
                  // track.enabled=false;
              }
              console.log(track);
          });
      }
      
  

      const localVideo = document.querySelector(`#${mySocketId}`);
      console.log(localVideo);
      if (localVideo) { 
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

socket.on("update-user-list", ({ users,myId }) => {
  mySocketId=myId
  updateUserList(users);
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
    //socket.emit("getMedia");
    getMedia(mySocketId);
  }

);
//toggle audio
let micBtn=document.getElementById("micBtn");
micBtn.addEventListener( "click",
  function(){ 
    mediaCheck.audio= !mediaCheck.audio 
    console.log(mediaCheck)
    //socket.emit("getMedia");
    getMedia(mySocketId);
  }
);

 function updateUserList(users) {
  //otherS
  console.log(users);
  const activeUserContainer = document.getElementById("smallVideosWrapper")

  while (activeUserContainer.firstChild) {
    activeUserContainer.removeChild(activeUserContainer.firstChild);
    console.log("vids removed for replacement")
  }
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

 // smallVideo.setAttribute("class", "");
 
  smallVideo.setAttribute("id",socketId);
  smallVideo.setAttribute("autoplay","true");
  
  

  

  smallVideoWrapper.appendChild(smallVideo);
  
  smallVideoWrapper.addEventListener("click", () => {
    // //unselectUsersFromList();
    // userContainerEl.setAttribute("class", "active-user active-user--selected");
    // const talkingWithInfo = document.getElementById("talking-with-info");
    // talkingWithInfo.innerHTML = `Talking with: "Socket: ${socketId}"`;
    callUser(socketId);
  }); 
  return smallVideoWrapper;
 }


 //RTC functions

 async function callUser(socketId) {
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(new RTCSessionDescription(offer));
  
  socket.emit("call-user", {
    offer,
    to: socketId
  });
 } 
 
 socket.on("call-made", async data => {
  await peerConnection.setRemoteDescription(
    new RTCSessionDescription(data.offer)
  );
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(new RTCSessionDescription(answer));
  
  socket.emit("make-answer", {
    answer,
    to: data.socket
  });
 });


 socket.on("answer-made", async data=>{
  await peerConnection.setRemoteDescription(
    new RTCSessionDescription(data.answer)
  );
 
 });

 peerConnection.ontrack = function({ streams:[stream] }) {
   const remoteStream= new MediaStream();
   remoteStream.addTrack(event.track ,stream);
  const remoteVideo = document.getElementById("remote-video");
  if (remoteVideo) {
    remoteVideo.srcObject =remoteStream;
  }
 }; 