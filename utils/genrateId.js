import crypto from "crypto";

const generateChatId = () => {
    return "CHAT-" + crypto.randomBytes(4).toString("hex").toUpperCase();
};

export default generateChatId;