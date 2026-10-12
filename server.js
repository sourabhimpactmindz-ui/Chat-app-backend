import app from "./app.js";
import dbconnect from "./config/db.config.js";
import http from 'http';
import { Server } from "socket.io";
import { socketHandler } from "./config/Sockit.js";
const PORT = process.env.PORT || 3009

const server = http.createServer(app);

export const io = new Server(server , {
    cors : {
        origin : "http://localhost:3000",
        credentials : true
        }
})

socketHandler(io);

await dbconnect()
server.listen(PORT , () => {
    console.log(`server is running on ${PORT}`)
})



