import express from "express"
import { userAuth } from "../middleware/auth.middleware.js"
import { getConversations } from "../controller/Conversation.controller.js"

const conroute = express.Router()

conroute.get("/conversation",userAuth,getConversations)

export default conroute;