import * as store from "./store.js";
import * as wss from "./wss.js";
import * as webRTCHandler from "./webRTCHandler.js";
import * as constants from "./constants.js";



// initialization socket.io
const socket = io("/")
wss.registerSocketEvents(socket)

webRTCHandler.getLocalPreview()


// register event copy button
const personalCopyButton = document.getElementById("personal_code_copy_button")
personalCopyButton.addEventListener("click",()=>{
   const personalCode = store.getState().socketId
   navigator.clipboard && navigator.clipboard.writeText(personalCode)
})


// register connection button

const personalCodeChatButton = document.getElementById("personal_code_chat_button")

const personalCodeVideoButton = document.getElementById("personal_code_video_button")


personalCodeChatButton.addEventListener("click",()=>{
    
    const calleePersonalCode = document.getElementById("personal_code_input").value;

    const callType = constants.callType.CHAT_PERSONAL_CODE

    webRTCHandler.sendPreOffer(callType,calleePersonalCode)
})

personalCodeVideoButton.addEventListener("click",()=>{
    const calleePersonalCode = document.getElementById("personal_code_input").value;
    const callType = constants.callType.VIDEO_PERSONAL_CODE

    webRTCHandler.sendPreOffer(callType,calleePersonalCode)
})
