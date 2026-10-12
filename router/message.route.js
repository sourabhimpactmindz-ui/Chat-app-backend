import { createConversation, getMessage, sendMessage } from "../controller/Message.controller.js";
import { userAuth } from "../middleware/auth.middleware.js";
import express from 'express'

const Messagerouter = express.Router();

Messagerouter.post("/send/:receiverId" , userAuth ,sendMessage)
Messagerouter.get("/messages/:conversationId",userAuth,getMessage)
Messagerouter.post("/New-message",userAuth,createConversation)

export default Messagerouter;