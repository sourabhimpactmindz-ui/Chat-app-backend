import mongoose from "mongoose";


const MessageSchema =  new mongoose.Schema({
    conversation : {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Conversation",
        required:true,
    },

    sender : {
        type : mongoose.Schema.Types.ObjectId,
        ref:"User",
        required : true
    },

    text : {
        type : String,
        trim : true,
        default : "",
    },

    mentions : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
    }],

    messageType: {
        type : String , 
        enum : ["text" , "image" , "video" , "file"],
        default : "text",
    }
},{timestamps : true})

export const Message =  mongoose.model("Message" , MessageSchema)