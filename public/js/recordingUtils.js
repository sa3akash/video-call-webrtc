import * as store from "./store.js"

let mediaRecorder;
let recorderChunk=[]
///video codec
const vp9Codecs = "video/webm; codecs=vp=9"
const vp9Options = {mimeType: vp9Codecs}


export const startRecording = () => {
    const remoteStream = store.getState().remoteStream;

    if(MediaRecorder.isTypeSupported(vp9Codecs)){
        mediaRecorder = new MediaRecorder(remoteStream, vp9Options);
    }else{
        mediaRecorder = new MediaRecorder(remoteStream);
    }
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.start()
}


//// data available handler
const handleDataAvailable =(e)=>{
    if(e.data.size > 0){
        recorderChunk.push(e.data)
        downloadRecordedVideo()
    }
}



//// pause
export const pauseRecording = () => {
    mediaRecorder.pause();
}


//// resume
export const resumeRecording = () => {
    mediaRecorder.resume();
}


/// stop and save recording
export const stopRecording = () => {
    mediaRecorder.stop();
}


/// download recorded video
const downloadRecordedVideo = () => {
    const blob = new Blob(recorderChunk, {type: "video/webm"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.href = url;
    a.download = "recording.webm";
    a.style = "display:none"
    a.click();
    //revokeUrl
    URL.revokeObjectURL(url);
}



