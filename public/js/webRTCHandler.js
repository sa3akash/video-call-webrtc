import * as wss from "./wss.js";
import * as constants from "./constants.js";
import * as ui from "./ui.js";
import * as store from "./store.js"

let connectUserDetails;
let peerConnection;


const configuration = {
    iceServers:[
        {urls:"stun:stun.l.google.com:13902"},
        {urls:"stun:stun.l.google.com:19302"},
        {urls:"stun:stun1.l.google.com:19302"},
        {urls:"stun:stun2.l.google.com:19302"},
        {urls:"stun:stun3.l.google.com:19302"},
    ]
}

const defaultConstaints = {
    audio:true,
    video:true
}

export const getLocalPreview = () => {
    navigator.mediaDevices.getUserMedia(defaultConstaints)
    .then((streem)=>{
        ui.updateLocalVideo(streem)
        store.setLocalStream(streem)
    }).catch((err)=>{
        console.log("err show when get camera or audio")
        console.log(err)
    })
}

const createPeerConnection = () => {
    peerConnection = new RTCPeerConnection(configuration)

    peerConnection.onicecandidate = (event) => {
        console.log("geeting ice candidates form stun server")
        if (event.candidate) {
            
        }
    }

    peerConnection.onconnectionstatechange = (event) => {
        if(peerConnection.connectionState === "connected"){
            console.log("succesfully connected with other peer")
        }
    }

    // reciving track

    const remoteStreem = new MediaStream();
    store.setRemoteStream(remoteStreem)
    ui.updateRemoteVideo(remoteStreem)
}


export const sendPreOffer = (callType,calleePersonalCode) => {
    connectUserDetails = {
        socketId: calleePersonalCode,
        callType: callType
    }
    
    if(callType === constants.callType.CHAT_PERSONAL_CODE || callType === constants.callType.VIDEO_PERSONAL_CODE){
        const data = {
            callType: callType,
            calleePersonalCode: calleePersonalCode
        }
        wss.sendPreOffer(data)

        ui.showCallingDialog(callType,callerRejectHandler)
        console.log(data)
     }
    
}


export const handlePreOffer = (data) =>{
     const {callType,callerSocketId} = data;

     connectUserDetails = {
        socketId: callerSocketId,
        callType: callType
     }
     console.log(data)

     if(callType === constants.callType.CHAT_PERSONAL_CODE || callType === constants.callType.VIDEO_PERSONAL_CODE){
        ui.showIncomingCallDialog(callType, acceptCallHandler,rejectCallHandler)
     }
}




const acceptCallHandler = () => {
    console.log("call accepted")
    sendPreOfferAnswer(constants.preOfferAnswer.CALL_ACCEPTED)
    ui.showCallElements(connectUserDetails.callType)
}

const rejectCallHandler = () => {
    console.log("call rejected")
    sendPreOfferAnswer(constants.preOfferAnswer.CALL_REJECTED)

}

// call rejection
const callerRejectHandler = () => {
    console.log("call cancel")

}


const sendPreOfferAnswer = (preOfferAnswer) => {
    const data = {
        callerSocketId: connectUserDetails.socketId,
        preOfferAnswer: preOfferAnswer
    }
    ui.removeAllDialogs()
    wss.sendPreOfferAns(data)
}



export const handlePreOfferAns = (data) => {
    const {callerSocketId,preOfferAnswer} = data;

    ui.removeAllDialogs()

    console.log("pre offer check")
    console.log(data)

    if(preOfferAnswer === constants.preOfferAnswer.CALLEE_NOT_FOUND){
        // show dilog colle not found
        ui.showInfoDialog(preOfferAnswer)
    }
    if(preOfferAnswer === constants.preOfferAnswer.CALL_UNAVAILABLE){
        // show dilog colle not able to connect
        ui.showInfoDialog(preOfferAnswer)
    }
    if(preOfferAnswer === constants.preOfferAnswer.CALL_REJECTED){
        // show dilog colle rejected by the colle
        ui.showInfoDialog(preOfferAnswer)
    }
    if(preOfferAnswer === constants.preOfferAnswer.CALL_ACCEPTED){
        // send webRTC offer
        ui.showCallElements(connectUserDetails.callType)

    }
}