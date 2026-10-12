import express from 'express'
import { GetAllUser, LoginUser, Signup , RefreshToken, searchUser, Getme, UpdateProfile, LogOut } from '../controller/user.controller.js'
import { userAuth } from '../middleware/auth.middleware.js'
import { upload } from '../middleware/multer.middleware.js'

const router = express.Router()

router.post("/signup",Signup)
router.post("/login",LoginUser)
router.get("/users", userAuth,GetAllUser)
router.post("/refresh",RefreshToken)
router.get("/search/:chatId",userAuth,searchUser)
router.get("/me",userAuth,Getme)
router.put("/profile",userAuth,upload.fields([{name : "avatar" , maxCount: 1} , {name : "cover" , maxCount:1}]),UpdateProfile)
router.post("/logout" , LogOut)

export default router;