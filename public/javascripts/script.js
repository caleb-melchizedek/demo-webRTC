
//const port = normalizePort(process.env.PORT || '3000');
const socket =io();

const { RTCPeerConnection, RTCSessionDescription } = window;
const peerConnection= new RTCPeerConnection;

//capture local media

const constraints={
video: false,
audio:false
}

function getMedia(socketId){
  
  //check for mediadevices
  if (navigator.mediaDevices === undefined) {
    navigator.mediaDevices = {};
  }
  // For browsers with partial implementation mediaDevices. 
  // Assign a constraints object to getUserMedia if such properties don't exist.
  // Add the getUserMedia property if missing.
  if (navigator.mediaDevices.getUserMedia === undefined) {
    navigator.mediaDevices.getUserMedia = function(constraints) {

      // First get legacy getUserMedia, if present
      var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

      // Some browsers just don't implement it - return a rejected promise with an error
      // to keep a consistent interface
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
      const localVideo = document.querySelector(`#${socketId}`);
      console.log(localVideo);
      if (localVideo) {
        localVideo.srcObject = stream;
      };
      stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
    }
  ).catch(
    error => {console.warn(error.message) }
  );;
}

  // || navigator.mozGetUserMedia || navigator.webkitGetUserMedia

//socket operations

socket.on("update-user-list", ({ users,myId }) => {
  updateUserList(users,myId);
 });

 socket.on("showMedia",socketId=>getMedia(socketId.socketId));

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
    media.video= !media.video 
    console.log(media)
    socket.emit("getMedia");
  }

);
//toggle audio
let micBtn=document.getElementById("micBtn");
micBtn.addEventListener( "click",
  function(){ 
    media.audio= !media.audio 
    console.log(media)
    socket.emit("getMedia");
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
  const smallVideoWrapper = document.createElement("div");
  const smallVideo = document.createElement("video");

  smallVideoWrapper.setAttribute("class", "wrapper");
  smallVideoWrapper.setAttribute("id",name );

 // smallVideo.setAttribute("class", "");
  smallVideo.setAttribute("id",socketId);
  smallVideo.setAttribute("autoplay","true");
  smallVideo.setAttribute("muted","true");
  

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