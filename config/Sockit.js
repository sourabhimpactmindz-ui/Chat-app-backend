const onlineUsers = new Map();

export const getReceiverSocketId = (userid) => { 
    return onlineUsers.get(userid);
};

export const socketHandler = (io) => {
    io.on("connection" , (socket) => {
        console.log("user connected",socket.id);
        socket.on("setup",(userid) => {
            onlineUsers.set(userid,socket.id);
            io.emit("online-users",[...onlineUsers.keys()]);
        });

        socket.on("disconnect",()=>{
            for (const [userid,socketId] of onlineUsers.entries()){
                if(socketId === socket.id){
                    onlineUsers.delete(userid);
                    break;
                }
            }

            io.emit("online-users" , [...onlineUsers.keys()]);
            console.log("disconnected")
        })
    })
}