import * as wss from "./wss.js";
import * as constants from "./constants.js";
import * as ui from "./ui.js";
import * as store from "./store.js";

let connectedUserDetails;
let peerConnections;
let dataChannel;

export const getLocalPreviews = () => {
    navigator.mediaDevices.getUserMedia({audio: true, video: true}).then((stream)=>{
        ui.updateLocalStream(stream)
        store.setLocalStream(stream)
        store.setCallState(constants.callState.CALL_AVAILABLE)
        ui.showVideoCallButtons()
    }).catch((err)=>{
        console.log("error when get camera or mycrophone access.")
        console.log(err)
    })
}

// create local peer connecton
const configarations = {
    iceServers: [
        {urls: "stun:stun.l.google.com:13902"},
        {urls: "stun:stun1.l.google.com:19302"},
        {urls: "stun:stun2.l.google.com:19302"},
        {urls: "stun:stun3.l.google.com:19302"},
        {urls: "stun:stun4.l.google.com:19302"},
    ]
}


const createPeerConnection = () => {
    peerConnections = new RTCPeerConnection(configarations)

    //datachannel
    dataChannel = peerConnections.createDataChannel("chat")

    peerConnections.ondatachannel = (e) => {
       const channelData = e.channel
       channelData.onopen = () => {
            console.log("datachannel open")
        }
        channelData.onclose = () => {
            console.log("datachannel close")
        }
        channelData.onmessage = (e) => {
            const message = JSON.parse(e.data)
            // console.log(message)
            ui.appendMessage(message)
        }
    }

//datachannel end

    peerConnections.onicecandidate = (event)=>{
        // console.log(event)
        if(event.candidate){
            // send your ice candidate to others
            wss.sendDataUsingWebRTC({
                connectedUserSocketId: connectedUserDetails.socketId,
                type: constants.webRTCSingnaling.ICE_CANDIDATE,
                candidate: event.candidate
            })
        }
    }

    peerConnections.oniceconnectionstatechange = event =>{
        if(peerConnections.connectionState === "connected"){
            console.log("successfully connected others peer")
        }
    }

    /// receiving tracks
    const remoteStream = new MediaStream()
    store.setRemoteStream(remoteStream)
    ui.updateRemoteVideo(remoteStream)

    peerConnections.ontrack = (e) => {
        remoteStream.addTrack(e.track)
    }

    // add your strem to connection
    if(connectedUserDetails.callType === constants.callType.VIDEO_PERSONAL_CODE){
        const localStream = store.getState().localStream;

        for (const track of localStream.getTracks()){
            peerConnections.addTrack(track, localStream)
        }
    }

}



// send preOffer
export const sendPreOffer = (callType, callePersonalCode) => {
    connectedUserDetails = {
        socketId: callePersonalCode,
        callType
    }
    if(callType === constants.callType.CHAT_PERSONAL_CODE || callType === constants.callType.VIDEO_PERSONAL_CODE){
        const data = {callType, callePersonalCode}
        wss.sendPreOffer(data)
        ui.showCallingDialog(callCancelHandler)
    }
   
}


export const handlePreOffer = (data) => {
    const {callType,callerSocketId} = data;
    connectedUserDetails = {
        socketId: callerSocketId,
        callType
    }
    if(callType === constants.callType.CHAT_PERSONAL_CODE || callType === constants.callType.VIDEO_PERSONAL_CODE){
        ui.showIncomingCall(callType,acceptCallHandler,rejectCallHandler)
    }
}


const acceptCallHandler = () =>{
    createPeerConnection()
    sendPreOfferAnswer(constants.preOfferAnswer.CALL_ACCEPTED)
    ui.showCallEliments(connectedUserDetails.callType)
}


const rejectCallHandler = () =>{
    sendPreOfferAnswer(constants.preOfferAnswer.CALL_REJECTED)
}


const callCancelHandler = () =>{
}


const sendPreOfferAnswer = (preOfferAnswer) => {
    const data = {
        callerSocketId: connectedUserDetails.socketId,
        preOfferAnswer: preOfferAnswer
    }
    ui.removeAllDialog()
    wss.sendPreOfferAnswer(data)
}


export const handlePreOfferAnswer = ({preOfferAnswer}) => {
    ui.removeAllDialog()


    if(preOfferAnswer === constants.preOfferAnswer.CALLEE_NOT_FOUND){
        ui.showInfoDialog(preOfferAnswer)
    }
    if(preOfferAnswer === constants.preOfferAnswer.CALL_UNAVAILABLE){
        ui.showInfoDialog(preOfferAnswer)
    }
    if(preOfferAnswer === constants.preOfferAnswer.CALL_REJECTED){
        ui.showInfoDialog(preOfferAnswer)
    }
    if(preOfferAnswer === constants.preOfferAnswer.CALL_ACCEPTED){
        ui.showCallEliments(connectedUserDetails.callType)
        createPeerConnection()
        sendWebRTCOffer()
    }
}


// sender
const sendWebRTCOffer = async () => {
    const offer = await peerConnections.createOffer()
    await peerConnections.setLocalDescription(offer)

    wss.sendDataUsingWebRTC({
        connectedUserSocketId: connectedUserDetails.socketId,
        type: constants.webRTCSingnaling.OFFER,
        offer: offer
    })
}

//receiver
export const handleWebRTCOffer = async (data) => {
    await peerConnections.setRemoteDescription(data.offer)

    const answer = await peerConnections.createAnswer()
    await peerConnections.setLocalDescription(answer)
    wss.sendDataUsingWebRTC({
        connectedUserSocketId: connectedUserDetails.socketId,
        type: constants.webRTCSingnaling.ANSWER,
        answer: answer
    })
}


/// handle webrtc ans

export const handleWebRTCAnswer = async (data) => {
    console.log("handle webrtc answer")
    await peerConnections.setRemoteDescription(data.answer)
}


// handle webrtc candidate
export const handleWebrtcCandidate = async (data) => {
    console.log("handle incoming web rtc")
    try{
        await peerConnections.addIceCandidate(data.candidate)
    }catch(err){
        console.log(err)
    }
}


/// screem sharing active
let screenSharingStream;
export const swithBetweenCameraScreem = async (isScreenSharingActive) => {
    try{
        if(isScreenSharingActive){
            backOtLocal(isScreenSharingActive)
        }else{
            console.log("switing for screen sharing")
            screenSharingStream = await navigator.mediaDevices.getDisplayMedia({video:true})
            store.setScreenSharingStream(screenSharingStream)
            //replace video tracks
            const senders = peerConnections.getSenders();
            const sender = senders.find((s)=> s.track.kind === screenSharingStream.getVideoTracks()[0].kind)
            if(sender){
                sender.replaceTrack(screenSharingStream.getVideoTracks()[0])
            }
            // on click stop sharing button
            screenSharingStream.getVideoTracks()[0].onended = () => {
                backOtLocal(isScreenSharingActive)
              };

            store.setScreenSharingActive(!isScreenSharingActive)
            ui.updateLocalStream(screenSharingStream)
        }
    }catch(err){
        console.log(err)
    }
}


/// back too local stram
const backOtLocal = (isScreenSharingActive) => {
    // if screen sharing is activ then swith base to camera
    const localStream = store.getState().localStream;
    //replace video tracks
    const senders = peerConnections.getSenders();
    const sender = senders.find((s)=> s.track.kind === localStream.getVideoTracks()[0].kind)
    if(sender){
        sender.replaceTrack(localStream.getVideoTracks()[0])
    }
    //stop sreen sharing stream
    store.getState().screenSharingStream.getTracks().forEach(track=>track.stop())
    store.setScreenSharingActive(!isScreenSharingActive)
    ui.updateLocalStream(localStream)
}



////data channel work 
export const sendMessageUsingDataChannel = (message) => {
    const stringfyMessage = JSON.stringify(message)
    dataChannel.send(stringfyMessage)
}


/// start recording




//// hangup
export const handleHangUp = () => {
  const data = {
   connectedUserSocketId : connectedUserDetails.socketId,
  }
  wss.sendHangUp(data)
  closePeerConnectionAndResetState()
}

export const handleConnectedUserHangUp = (data) => {
    console.log("handleConnectedUserHangUp pressed")
    closePeerConnectionAndResetState()
}

const closePeerConnectionAndResetState = () => {
    if(peerConnections){
        peerConnections.close()
        peerConnections = null
    }
    // if video call is active
    if(connectedUserDetails.callType === constants.callType.VIDEO_PERSONAL_CODE || connectedUserDetails.callType === constants.callType.VIDEO_STRANGER){
        store.getState().localStream.getVideoTracks()[0].enabled = true;
        store.getState().localStream.getAudioTracks()[0].enabled = true;
    }
    // update ui
    ui.updateUiAfterHangUp(connectedUserDetails.callType)
    connectedUserDetails = null;
}


