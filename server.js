const express = require("express")
const http = require("http")

const app = express()
const server = http.createServer(app)
const io = require("socket.io")(server)
// middlewares
app.use(express.static("public"))
app.use(express.json())
app.use(express.urlencoded({extended:true}))

// routes
app.get("/",(req,res)=>{
    res.sendFile(__dirname + "/public/index.html")
})


// socket io

let connectedPeers = [];

io.on("connection",(socket)=>{
    console.log(`User connected to socket.io ${socket.id}`)
    connectedPeers.push(socket.id)


    socket.on("pre-offer", (data)=>{
        const {callType,calleePersonalCode} = data;

        const connectedPear = connectedPeers.find(pearId=>pearId ===calleePersonalCode)
        
        if(connectedPear) {
            const data = {
                callerSocketId:socket.id,
                callType
            }
            io.to(calleePersonalCode).emit("pre-offer",data)
        }else{
            const data = {
                preOfferAnswer:"CALLEE_NOT_FOUND"
            }
            io.to(socket.id).emit("pre-offer-ans",data)
        }
    });


    socket.on("pre-offer-ans",(data)=>{

        const {callerSocketId,preOfferAnswer} = data;

        console.log(data)
        const connectedPear = connectedPeers.find(pearId=>pearId ===callerSocketId)
        
        if(connectedPear) {
            io.to(callerSocketId).emit("pre-offer-ans",data)
        }

    })


    socket.on("disconnect",()=>{
        console.log(`User disconnected from socket.io ${socket.id}`)
        // remove user to connectpeers
        connectedPeers.splice(connectedPeers.indexOf(socket.id),1)
    })
})




const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>console.log(`Server running on port ${PORT}`))