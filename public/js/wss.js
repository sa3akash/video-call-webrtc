import * as store from './store.js';
import * as ui from "./ui.js";
import * as webRTCHandler from "./webRTCHandler.js";


let socketIO = null;

export const registerSocketEvents = (socket) => {
    socket.on("connect",()=>{
        socketIO = socket;
        console.log(`successfully connected to socket.io server`)
        store.setSocketId(socket.id)
        ui.updatePersonalCode(socket.id)
    })

    socket.on("pre-offer",(data)=>{
        webRTCHandler.handlePreOffer(data)
    })

    socket.on("pre-offer-ans",(data)=>{
        webRTCHandler.handlePreOfferAns(data)
    })

}



export const sendPreOffer = (data) => {
    socketIO.emit("pre-offer",data)
}



export const sendPreOfferAns = (data) => {
    socketIO.emit("pre-offer-ans",data)
}
