import mongoose from "mongoose";



const ConversationSchema = new mongoose.Schema(
    {
    participants: [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
        },
    ],

    lastMessage : {
        type : mongoose.Schema.Types.ObjectId,
        ref: "Message",
        default:null,
    },

    isGroup: {
        type : Boolean,
        default : false,
    },

    groupName : {
        type : String,
        default : "",
    },

    groupAvatar :{
        type : String,
        default : "",
    },

    groupAdmin : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    unreadCount  : {
        type : Map,
        of : Number,
        default : {}
    }
},
    {
        timestamps : true,
    }
)

ConversationSchema.index({ participants : 1 });

export const Conversation =  mongoose.model("Conversation" , ConversationSchema);