import * as constants from './constants.js';
import * as eliments from './eliments.js';



export const updatePersonalCode = (personalCode) => {
    const personalCodeParagraph = document.getElementById("personal_code_paragraph")
    personalCodeParagraph.innerHTML = personalCode
}


export const updateLocalVideo = (streem) => {
  const localVideo = document.getElementById("local_video")
  localVideo.srcObject = streem;
  localVideo.addEventListener("loadedmetadata",()=>{
    localVideo.play();
  })
}



export const showIncomingCallDialog = (callType, acceptCallHandler,rejectCallHandler) => {
    const callTypeInfo = callType === constants.callType.CHAT_PERSONAL_CODE ? "Chat" : "Video";

  const incomingCallDialog =  eliments.getIncomingCallDialog(callTypeInfo,acceptCallHandler,rejectCallHandler)

  const dialogHTML = document.getElementById("dialog");
  dialogHTML.querySelectorAll("*").forEach((dialog=>dialog.remove()))
  dialogHTML.appendChild(incomingCallDialog);
}


export const showCallingDialog = (callType,callerRejectHandler) => {

  const callingDialog = eliments.getCallingDialog(callerRejectHandler)
  const dialogHTML = document.getElementById("dialog");
  dialogHTML.querySelectorAll("*").forEach((dialog=>dialog.remove()))
  dialogHTML.appendChild(callingDialog);

}


// remove dialog
export const removeAllDialogs = () => {
  const dialog = document.getElementById("dialog");
  dialog.querySelectorAll("*").forEach((dialog) => dialog.remove());
};


export const showInfoDialog = (preOfferAnswer) => {
  let infoDialog = null;
  if(preOfferAnswer === constants.preOfferAnswer.CALL_REJECTED) {
    infoDialog = eliments.getInfoDialog("Call rejected","Callee rejected your call")
  }
  if(preOfferAnswer === constants.preOfferAnswer.CALLEE_NOT_FOUND) {
    infoDialog = eliments.getInfoDialog("Callee not found","Please check personal code")
  }
  if(preOfferAnswer === constants.preOfferAnswer.CALL_UNAVAILABLE) {
    infoDialog = eliments.getInfoDialog("Call is not possible","Probably calle is busy. Please try agin letter")
  }
  
  if(infoDialog) {
    const dialog = document.getElementById("dialog")
    dialog.appendChild(infoDialog)

    setTimeout(()=>{
      removeAllDialogs()
    },[3000])
  }
}


///===================

export const  showCallElements = (callType) => {
  if(callType === constants.callType.CHAT_PERSONAL_CODE){
    showChatCallElements()
  }
  if(callType === constants.callType.VIDEO_PERSONAL_CODE){
    showVideoCallElements()
  }
}


const showChatCallElements = () => {
  const finishConnectionChatButtonContainer = document.getElementById("finish_chat_button_container")
  showEliment(finishConnectionChatButtonContainer)

  const newMessageInput = document.getElementById("new_message")
  showEliment(newMessageInput)
  //block panel
  disabledDashboard()
}


const showVideoCallElements = () => {
  const callButtons = document.getElementById("call_buttons")
  showEliment(callButtons)

  const placeholder = document.getElementById("video_placeholder")
  hideEliment(placeholder)

  const remoteVideo = document.getElementById("remote_video")
  showEliment(remoteVideo)

  const newMessageInput = document.getElementById("new_message")
  showEliment(newMessageInput)
  //block panel
  disabledDashboard()
}

// enable dashboard 


const enableDashboard = () => {
  const dashboardBlocker = document.getElementById("dashboard_blur");
  if(!dashboardBlocker.classList.contains("display_none")){
    dashboardBlocker.classList.add("display_none")
  }
}

const disabledDashboard = () => {
  const dashboardBlocker = document.getElementById("dashboard_blur");
  if(dashboardBlocker.classList.contains("display_none")){
    dashboardBlocker.classList.remove("display_none")
  }
}


const hideEliment = (eliment) => {
  if(!eliment.classList.contains("display_none")){
    eliment.classList.add("display_none");
  }
}


const showEliment = (eliment) => {
  if(eliment.classList.contains("display_none")){
    eliment.classList.remove("display_none");
  }
}



