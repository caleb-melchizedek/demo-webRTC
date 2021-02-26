
//const port = normalizePort(process.env.PORT || '3000');
const socket =io();

const { RTCPeerConnection, RTCSessionDescription } = window;
const peerConnection= new RTCPeerConnection;

//capture local media

const media={
video: false,
audio:false
}

function getMedia(){
  navigator.mediaDevices.getUserMedia(media)
  .then(
    stream => {
      window.stream = stream;
      const localVideo = document.getElementById("local-video");
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
    getMedia();
  }

);
//toggle audio
let micBtn=document.getElementById("micBtn");
micBtn.addEventListener( "click",
  function(){ 
    media.audio= !media.audio 
    console.log(media)
    getMedia();
  }
);


 function updateUserList(users,my_Id) {
  //otherS
  users.forEach(user => {
    const alreadyExistingUser = document.getElementById(user.name);
    if (!alreadyExistingUser) {
      console.log("no exisiting user found")
      const userContainerEl = createUserItemContainer(user.socketId, user.name);
      const activeUserContainer = document.getElementById("smallVideosWrapper")
      activeUserContainer.appendChild(userContainerEl); 
    }
  });
  console.log("User list was just updated");
 }


 function createUserItemContainer(socketId, name) {
  const smallVideoWrapper = document.createElement("div");
  const smallVideo = document.createElement("video");

  smallVideoWrapper.setAttribute("class", "wrapper");
  smallVideoWrapper.setAttribute("id", socketId);

  smallVideo.setAttribute("class", "local-video");
  smallVideo.setAttribute("id", name);
  
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