import * as constants from './constants.js';
import * as eliments from "./eliments.js"



export const updateLocalStream = (stream) => {
  const localVideo = document.getElementById("local_video")
  localVideo.srcObject = stream
  
  localVideo.addEventListener("onloadedmetadata",()=>{
    localVideo.play()
  })
}

export const updateRemoteVideo = (stream) => {
  const remoteVideo = document.getElementById("remote_video")
  remoteVideo.srcObject = stream
}



export const updatePersonalCode = (socketId) => {
  const personalCodeParagraph = document.getElementById("personal_code_paragraph")
  personalCodeParagraph.innerHTML = socketId
}

export const showIncomingCall = (callType,acceptCallHandler,rejectCallHandler) => {
    const callTypeInfo = callType === constants.callType.CHAT_PERSONAL_CODE ? "Chat" : "Video";
    const incomingDialog = eliments.getIncomingCallDialog(callTypeInfo,acceptCallHandler,rejectCallHandler)

    const dialog = document.getElementById("dialog")
    dialog.querySelectorAll("*").forEach(dialog=>dialog.remove())
    dialog.appendChild(incomingDialog)
}


export const showCallingDialog = (callCancelHandler) => {
  const callingDialog = eliments.getCallingDialog(callCancelHandler)
  const dialog = document.getElementById("dialog")
  dialog.querySelectorAll("*").forEach(dialog=>dialog.remove())
  dialog.appendChild(callingDialog)
}

//remove all dialog 
export const removeAllDialog = () => {
  const dialog = document.getElementById("dialog")
  dialog.querySelectorAll("*").forEach(dialog=>dialog.remove())
}



/// shfow info dialog
export const showInfoDialog = (preOfferAnswer) => {
  let infoDialog;
  if(preOfferAnswer === constants.preOfferAnswer.CALL_REJECTED){
      infoDialog = eliments.getInfoDialog("Call Rejected","Callee reject yout call")
  }
  if(preOfferAnswer === constants.preOfferAnswer.CALLEE_NOT_FOUND){
    infoDialog = eliments.getInfoDialog("Callee Not Found","Please check personal code.")
  }
  if(preOfferAnswer === constants.preOfferAnswer.CALL_UNAVAILABLE){
    infoDialog = eliments.getInfoDialog("Call is not possible","Probably callee is busy.")
  }
 
  if(infoDialog){
    const dialog = document.getElementById("dialog")
    dialog.querySelectorAll("*").forEach(dialog=>dialog.remove())
    dialog.appendChild(infoDialog)
    setTimeout(()=>{
      removeAllDialog()
    },4000)
  }
}

// show call eliments

export const showCallEliments = (callType) => {
  if(callType === constants.callType.CHAT_PERSONAL_CODE){
    showChatCallEliments()
  }
  if(callType === constants.callType.VIDEO_PERSONAL_CODE){
    showVideoCallEliments()
  }
}

const showChatCallEliments = () => {
  const finishChatButtonContaienr = document.getElementById("finish_chat_button_container")
  showEliments(finishChatButtonContaienr)

  const newMessageInput = document.getElementById("new_message")
  showEliments(newMessageInput)

  disabledDashboard()

}

const showVideoCallEliments = () => {
  const videoCallButton = document.getElementById("call_buttons")
  showEliments(videoCallButton)

  const remoteVideo = document.getElementById("remote_video")
  showEliments(remoteVideo)

  const placeHolder = document.getElementById("video_placeholder")
  hideEliments(placeHolder)
  
  const newMessageInput = document.getElementById("new_message")
  showEliments(newMessageInput)

  disabledDashboard()
}

// ui helpers functions

const enabledDashboard = () => {
    const dashboardBlocker = document.getElementById("dashboard_blur")

    if(!dashboardBlocker.classList.contains("display_none")){
      dashboardBlocker.classList.add("display_none")
    }
}


const disabledDashboard = () => {
    const dashboardBlocker = document.getElementById("dashboard_blur")

    if(dashboardBlocker.classList.contains("display_none")){
      dashboardBlocker.classList.remove("display_none")
    }
}


// hide eliments
const hideEliments = (eliment) => {
  if(!eliment.classList.contains("display_none")){
    eliment.classList.add("display_none")
  }
}

// show eliments
const showEliments = (eliment) => {
  if(eliment.classList.contains("display_none")){
    eliment.classList.remove("display_none")
  }
}



// update mic button
let micOnImgSrc = "/utils/images/mic.png";
let micOffImgSrc = "/utils/images/micOff.png";
export const updateMicButton = (micEnabled) => {
  const micButtonImg = document.getElementById("mic_button_image");
  micButtonImg.src = micEnabled ? micOffImgSrc : micOnImgSrc;
}

// update camera button
let cameraOn = "/utils/images/camera.png";
let cameraOff = "/utils/images/cameraOff.png";
export const updateCameraButton = (cameraEnabled) => {
  const micButtonImg = document.getElementById("camera_button_image");
  micButtonImg.src = cameraEnabled ? cameraOff : cameraOn;
}




/// message
export const appendMessage = (message,right=false)=>{
  const messageContainer = document.getElementById("messages_container")
  const messageEliment = right ? eliments.getRightMessage(message) : eliments.getLeftMessage(message)

  messageContainer.appendChild(messageEliment)
}



/// message
export const clearMessage = (message,right=false)=>{
  const messageContainer = document.getElementById("messages_container")
  messageContainer.querySelectorAll("*").forEach(c=>c.remove())
}





/////===================recording=================//// 


export const showRecordingPanel = () => {
  const recordingButton = document.getElementById("video_recording_buttons")
  showEliments(recordingButton)
  // hide recording button if it's active
  const startRecordingButton = document.getElementById("start_recording_button")
  hideEliments(startRecordingButton)

}


/// reset recording button
export const resetRecordingPanel = () => {
  const startRecordingButton = document.getElementById("start_recording_button")
  showEliments(startRecordingButton)
  // hide recording panel
  const recordingPanelButton = document.getElementById("video_recording_buttons")
  hideEliments(recordingPanelButton)
}

/// swith recording button
export const switchRecordingButton = (switchForResume = false) => {
  const resumeButton = document.getElementById("resume_recording_button")
  const pauseButton = document.getElementById("pause_recording_button")

  if(switchForResume){
    showEliments(resumeButton)
    hideEliments(pauseButton)
  }else{
    showEliments(pauseButton)
    hideEliments(resumeButton)
  }
}


/// show video call buttons
export const showVideoCallButtons = () => {
  const personalCodeVideoButton = document.getElementById("personal_code_video_button")
  const stangerCodeVideoButton = document.getElementById("stranger_video_button")

  showEliments(personalCodeVideoButton)
  showEliments(stangerCodeVideoButton)
}


// update ui after hangup button click
export const updateUiAfterHangUp = (callType) => {
  enabledDashboard()
  //hide the call button
  if(callType === constants.callType.VIDEO_PERSONAL_CODE || callType === constants.callType.VIDEO_STRANGER){
    const callbutton = document.getElementById("call_buttons")
    hideEliments(callbutton)
  }else{
    const chatCallButton = document.getElementById("finish_chat_button_container")
    hideEliments(chatCallButton)
  }
  const newMessageInput = document.getElementById("new_message")
  hideEliments(newMessageInput)
  clearMessage()
  updateMicButton(false)
  updateCameraButton(false)
  //update remote video and show palceholders
  const remoteVideo = document.getElementById("remote_video")
  hideEliments(remoteVideo)
  const placeholder = document.getElementById("video_placeholder")
  showEliments(placeholder)
  const personalCodeInput = document.getElementById("personal_code_input")
  personalCodeInput.value = ""
 // remove all dialogs
  removeAllDialog()
}



