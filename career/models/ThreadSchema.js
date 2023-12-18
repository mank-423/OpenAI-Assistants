import mongoose from "mongoose";

const threadSchema = new mongoose.Schema({
    threadId: {
        type: String,
        required: true,
        unique: true,
    },
    messageId: [
        {
            aiMessageId: {
                type: String,
                required: true,
            },
            userMessageId: {
                type: String,
                required: true,
            },
        }
    ],
});

const Thread = mongoose.model('Thread', threadSchema);

export default Thread;
