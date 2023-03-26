import * as store from "./store.js";
import * as ui from "./ui.js";
import * as webRTCHandler from "./webRTCHandler.js";
import * as constants from "./constants.js";


let socketIO;
export const registerSocketEvents = (socket) => {
    socketIO = socket
  //socket connect
  socket.on("connect", () => {
    console.log(socket.id)
    store.setSocketId(socket.id);
    ui.updatePersonalCode(socket.id)
  });
// other listener here
// reciver
  // pre offer listen
  socket.on("pre-offer", (data) => {
    // webrtc handle pre offer
    webRTCHandler.handlePreOffer(data)
  });
  // pre offer answer listen
  socket.on("pre-offer-answer", (data) => {
    // webrtc handle pre offer
    webRTCHandler.handlePreOfferAnswer(data)
  });

  // webrtc signaling server
  socket.on("webRTC_signaling", (data)=>{
    switch(data.type){
      case constants.webRTCSingnaling.OFFER : 
          webRTCHandler.handleWebRTCOffer(data)
          break;
      case constants.webRTCSingnaling.ANSWER : 
          webRTCHandler.handleWebRTCAnswer(data)
          break;
      case constants.webRTCSingnaling.ICE_CANDIDATE : 
          webRTCHandler.handleWebrtcCandidate(data)
          break;
        default : 
          return
    }
  })

  // hang up
  socket.on("user-hang-up",(data)=>{
    webRTCHandler.handleConnectedUserHangUp(data)
  })
};


///send
export const sendPreOffer = (data) => {
    socketIO.emit("pre-offer",data)
}


export const sendPreOfferAnswer = (data) => {
  socketIO.emit("pre-offer-answer",data)
}


// send data using webrtc
export const sendDataUsingWebRTC = (data) => {
  socketIO.emit("webRTC_signaling", data)

}

//// send Hang up

export const sendHangUp = (data) => {
  socketIO.emit("user-hang-up",data)
}