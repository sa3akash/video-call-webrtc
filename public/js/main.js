import * as store from "./store.js";
import * as wss from "./wss.js";
import * as webRTCHandler from "./webRTCHandler.js";
import * as constants from "./constants.js";
import * as ui from "./ui.js";

const socket = io("/");

// initialization socket connection
wss.registerSocketEvents(socket);
webRTCHandler.getLocalPreviews()
// register event listener for personal copy button
const personalCodeButton = document.getElementById("personal_code_copy_button");

personalCodeButton.addEventListener("click", () => {
  const personalCode = store.getState().socketId;
  navigator.clipboard && navigator.clipboard.writeText(personalCode);
});

// register event listener for connection buttob (message, call)
const personalCodeChatButton = document.getElementById("personal_code_chat_button");
const personalCodeVideoButton = document.getElementById("personal_code_video_button");


// after chat button click send pre offer
personalCodeChatButton.addEventListener("click", () => {
    const callePersonalCode = document.getElementById("personal_code_input").value;
    const callType = constants.callType.CHAT_PERSONAL_CODE;
    if(callePersonalCode){
        webRTCHandler.sendPreOffer(callType,callePersonalCode)
    }else{
        alert("Please inter personal chat code")
    }
});

// after video chat button click send pre offer
personalCodeVideoButton.addEventListener("click", () => {
    const callePersonalCode = document.getElementById("personal_code_input").value;
    const callType = constants.callType.VIDEO_PERSONAL_CODE;
    if(callePersonalCode){
        webRTCHandler.sendPreOffer(callType, callePersonalCode)
    }else{
        alert("Please inter personal video code")
    }
});


//// event listener for video call button
const micButton = document.getElementById("mic_button")
micButton.addEventListener("click",()=>{
    const localStream = store.getState().localStream;
    const micEnabled = localStream.getAudioTracks()[0].enabled;
    localStream.getAudioTracks()[0].enabled = !micEnabled;
    ui.updateMicButton(micEnabled)
})


//// event listener for video call camera button
const cameraButton = document.getElementById("camera_button")
cameraButton.addEventListener("click",()=>{
    const localStream = store.getState().localStream;
    const cameraEnabled = localStream.getVideoTracks()[0].enabled;
    localStream.getVideoTracks()[0].enabled = !cameraEnabled;
    ui.updateCameraButton(cameraEnabled)
})



//// event listener for video call camera button
const screemSharingButton = document.getElementById("screen_sharing_button")
screemSharingButton.addEventListener("click",()=>{
    const isScreenSharingActive = store.getState().screenSharingActive
    webRTCHandler.swithBetweenCameraScreem(isScreenSharingActive)
})

