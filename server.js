const express = require("express");
const http = require("http");
const app = express();

const server = http.createServer(app);
const io = require("socket.io")(server);

app.use(express.static("public"));

// routes
app.get("/",(req,res)=>{
    res.sendFile(__dirname+"/index.html");
})



// socket connection

let connectedPeers = []


io.on("connect",(socket)=>{
    // console.log(`User connected from socket.io ${socket.id}`)
    // add user to connectedPeers array
    connectedPeers.push(socket.id)



    // pre offer 
    socket.on("pre-offer",(data)=>{
        const {callType,callePersonalCode} = data;
        const userExist = connectedPeers.find((id)=> id === callePersonalCode)
        if(userExist){
            const data = {
                callType,
                callerSocketId : socket.id
            }
            io.to(callePersonalCode).emit("pre-offer",data)
        }else{
            const data = {
                preOfferAnswer: "CALLEE_NOT_FOUND"
            }
            io.to(socket.id).emit("pre-offer-answer",data)
        }
    })

    // pre offer answer
    socket.on("pre-offer-answer",(data)=>{
        const {callerSocketId,preOfferAnswer} = data;
        const userExist = connectedPeers.find((id)=> id === callerSocketId)
        if(userExist){
            const readyData = {
                preOfferAnswer
            }
            io.to(callerSocketId).emit("pre-offer-answer",readyData)
        }
    })

    // webrtc signaling
    socket.on("webRTC_signaling", (data)=>{
        const {connectedUserSocketId} = data;
        const userExist = connectedPeers.find((id)=> id === connectedUserSocketId)
        if(userExist){
            io.to(connectedUserSocketId).emit("webRTC_signaling",data)
        }
    })

    // user hang up
    socket.on("user-hang-up",(data)=>{
        const {connectedUserSocketId} = data;
        const userExist = connectedPeers.find((id)=> id === connectedUserSocketId)
        if(userExist){
            io.to(connectedUserSocketId).emit("user-hang-up",data)
        }
    })

    //after user disconnect
    socket.on("disconnect",()=>{
        // console.log(`User disconnected from socket.io ${socket.id}`)
        // remove user to connectpeers
        connectedPeers.splice(connectedPeers.indexOf(socket.id),1)
    })

    
})




// start server
const PORT = process.env.PORT || 5000;
server.listen(PORT,()=>console.log(`server start on port=${PORT}`))