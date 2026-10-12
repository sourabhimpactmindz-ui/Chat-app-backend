import express from 'express';
import dotenv from 'dotenv';
import router from './router/auth.route.js';
import Messagerouter from './router/message.route.js';
import conroute from './router/conversation.route.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
dotenv.config();

const app = express();

app.use(express.json())
app.use(cors({
    origin : "http://localhost:3000",
    credentials : true
}))
app.use(cookieParser())
app.use(express.urlencoded({ extended : true}))
app.use("/api",router,Messagerouter , conroute)

export default app;
