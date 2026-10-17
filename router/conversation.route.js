import express from "express"
import { userAuth } from "../middleware/auth.middleware.js"
import { getConversations } from "../controller/Conversation.controller.js"
import { createGroup } from "../controller/group.controller.js"

const conroute = express.Router()

conroute.get("/conversation",userAuth,getConversations)
conroute.post("/group/create",userAuth,createGroup)
export default conroute;