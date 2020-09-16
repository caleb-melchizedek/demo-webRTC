const socket =io('http://localhost:3000')

const { RTCPeerConnection, RTCSessionDescription } = window;
const peerConnection= new RTCPeerConnection;

//capture local media

const getMedia = navigator.mediaDevices.getUserMedia(
  { video: true, audio: true }
).then(
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
  );


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

 function updateUserList(socketIds,my_Id) {

  const otherSocketIds= socketIds.filter((socketId)=>{
    socketId !== my_Id;
  });
    console.log(typeof(my_Id));
    console.log(my_Id);
    console.log(socketIds);
   console.log(otherSocketIds);
  const activeUserContainer = document.getElementById("active-user-container");
  
  //otherS
  socketIds.forEach(socketId => {
    const alreadyExistingUser = document.getElementById(socketId);
    if (!alreadyExistingUser) {
      const userContainerEl = createUserItemContainer(socketId);
      activeUserContainer.appendChild(userContainerEl);
    }
  });
 }


 function createUserItemContainer(socketId) {
  const userContainerEl = document.createElement("div");
  
  const usernameEl = document.createElement("p");
  
  userContainerEl.setAttribute("class", "active-user");
  userContainerEl.setAttribute("id", socketId);
  usernameEl.setAttribute("class", "username");
  usernameEl.innerHTML = `Socket: ${socketId}`;
  
  userContainerEl.appendChild(usernameEl);
  
  userContainerEl.addEventListener("click", () => {
    //unselectUsersFromList();
    userContainerEl.setAttribute("class", "active-user active-user--selected");
    const talkingWithInfo = document.getElementById("talking-with-info");
    talkingWithInfo.innerHTML = `Talking with: "Socket: ${socketId}"`;
    callUser(socketId);
  }); 
  return userContainerEl;
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
  /*
  if(!isAlreadyCalling || isAlreadyCalling== null){
    callUser(data.socket);
    isAlreadyCalling=true;
  }*/
 });

 peerConnection.ontrack = function({ streams:[stream] }) {
   const remoteStream= new MediaStream();
   remoteStream.addTrack(event.track ,stream);
  const remoteVideo = document.getElementById("remote-video");
  if (remoteVideo) {
    remoteVideo.srcObject =remoteStream;
  }
 };