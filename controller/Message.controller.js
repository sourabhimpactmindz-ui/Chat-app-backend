import { getReceiverSocketId } from "../config/Sockit.js";
import  { Conversation } from "../model/conversation.model.js";
import { Message } from "../model/message.model.js";
import { User } from "../model/user.model.js";
import { io } from "../server.js";


export const sendMessage = async(req,res)=>{
    const senderId = req.userid;
    const receiverId = req.params.receiverId;


    try{

        const { text } = req.body;

        let conversation = await Conversation.findOne({
            participants : {
                $all : [senderId , receiverId]
            }
        });

        if(!conversation){
            conversation = await Conversation.create({
                participants : [senderId, receiverId]
            });
        }

        const message = await Message.create({
            conversation : conversation._id,
            sender : senderId,
            text
        });

        const populatedMessage = await Message.findById(message._id)
    .populate("sender", "name chatId images");

    

        conversation.lastMessage = message._id;
        await conversation.save();

        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
    io.to(receiverSocketId).emit(
        "receiver-message",
        populatedMessage
    );
}

        if(receiverSocketId){
            io.to(receiverSocketId).emit('receiver-message',message)
        }

        res.status(201).json({success : true , status:true, message})


    }catch(err){
        console.log(err)
        return res.status(500).json({message : "server error",status : false})
    }
}


export const getMessage = async(req,res) => {

    try{
        const messages = await Message.find({
            conversation: req.params.conversationId
        }).populate("sender","name chatId images.avatar.url")

        return res.status(201).json({message : "all messages fatched",status : true , messages})
        

    }catch(err){
        console.log(err)
        return res.status(500).json({success : false})
    }


}

export const createConversation = async(req,res) =>{
    const {text , chatId} = req.body;
    const senderId = req.userid;

    try{
        if(!chatId || !text){
            return res.status(400).json({message : "Chat ID and message are required" , status : false})
        }

        const receiver = await User.findOne({chatId});

        if(!receiver){ 
            return res.status(404).json({message : "User not found" , status : false})
        }


        if(receiver._id.toString() === senderId.toString()){
            return res.status(400).json({message : "you can not message your self" , status : false})
        }

        const conversation = await Conversation.findOne({
            isGroup : false,
            participants : {
                $all : [senderId , receiver._id],
                $size : 2 
            },
        });

        if(!conversation) {
           let  conversation = await Conversation.create({
                participants : [senderId, receiver._id],
                isGroup : false
            })
        }

        const message =  await Message.create({
            conversation : conversation.id,
            sender : senderId,
            text,
            // messageType
        })

        conversation.lastMessage = message._id;
        await conversation.save()

        return res.status(200).json({message : "message sent successfully",status : true , data : conversation})

    }catch(err){
        console.log(err)
        return res.status(500).json({message : "server errror"})
    }
}