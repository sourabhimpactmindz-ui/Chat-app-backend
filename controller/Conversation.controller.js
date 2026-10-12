import { Conversation } from "../model/conversation.model.js";

export const getConversations = async (req, res) => {
    try {

        const conversations = await Conversation.find({
            participants: req.userid
        })
        .populate("participants", "name chatId images.avatar.url")
        .populate({
            path: "lastMessage",
            populate: {
                path: "sender",
                select: "name"
            }
        })
        .sort({ updatedAt: -1 });

     return  res.status(200).json({
            success: true,
            data : conversations
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false
        });
    }
};


