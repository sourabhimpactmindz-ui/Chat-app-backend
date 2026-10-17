import mongoose, { set } from "mongoose";
import { Conversation } from "../model/conversation.model.js";
import { User } from "../model/user.model.js";
import { io } from "../server.js";



const memberIds = (group, userid) => {
    group.participants.some((id) => (
        id.toString() === String(userid)
    ))
}

const isAdmin = (group, userid) => {
    const admins = group.groupAdmins.length ? group.groupAdmins : [group.groupAdmin].filter(Boolean);

    return admins.some((id) => id.toString() === String(userid))
}


const populateGroup = (id) => {
    Conversation.findById(id)
        .populate("participants", "name chatId images")
        .populate("groupAdmins", "name chatId");
}

export const createGroup = async (req, res) => {
    const { groupName, memberIds = [] } = req.body;
    const creatorId = req.userid

    try {
        if (!groupName.trim()) {
            return res.status(400).json({ message: "Group name is required", status: false })
        }

        if (!Array.isArray(memberIds)) {
            return res.status(400).json({ message: "mamberId must be an array", status: false })
        }

        const ids = [
            ...new Set([String(req.userid), ...memberIds.map(String)])
        ]

        if (!ids.every(mongoose.isValidObjectId)) {
            return res.status(400).json({ message: "Invalid user id" })
        }

        const user = await User.find({
            _id: { $in: ids },
        }).select("_id")

        if (user.length !== ids.length) {
            return res.status(400).json({ message: "Some user do not exists" })
        }



        const group = await Conversation.create({
            groupName,
            isGroup: true,
            participants: [...new Set([
                creatorId.toString(),
                ...memberIds.map((id) => id.toString()),
            ])],
            groupAdmin: creatorId,
            groupAdmins: [creatorId],
        });

        ids.forEach((id) => {
            io.emit(`conversations-updated: ${id}`, {
                conversationId: group._id,
            });
        });

        return res.status(201).json({ status: true, data: await populateGroup(group._id) });

    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Server error", status: false })
    }
}


export const addGroupMembers = async (req, res) => {
    try {
        const group = await loadGroup(req.params.groupId);

        if (!group) {
            return res.status(404).json({
                success: false,
                message: "Group not found",
            });
        }

        if (!isAdmin(group, req.userid)) {
            return res.status(403).json({
                success: false,
                message: "Only admins can add members",
            });
        }

        const { memberIds = [] } = req.body;

        if (!Array.isArray(memberIds) || !memberIds.length) {
            return res.status(400).json({
                success: false,
                message: "Provide memberIds",
            });
        }

        const ids = [...new Set(memberIds.map(String))];

        if (!ids.every(mongoose.isValidObjectId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID",
            });
        }

        const users = await User.find({
            _id: { $in: ids },
        }).select("_id");

        if (users.length !== ids.length) {
            return res.status(400).json({
                success: false,
                message: "Some users do not exist",
            });
        }

        group.participants = [
            ...new Set([...group.participants.map(String), ...ids]),
        ];

        await group.save();

        ids.forEach((id) => {
            io.emit(`conversations-updated:${id}`, {
                conversationId: group._id,
            });
        });

        return res.json({
            success: true,
            data: await populateGroup(group._id),
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Could not add members",
        });
    }
};