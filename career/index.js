import express from 'express';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/dbconfig.js'
import User from './models/UserSchema.js'


dotenv.config();
const port = process.env.PORT || 5000;
const mongo_url = process.env.MONGO_URL;

const app = express();

// Enable CORS
app.use(cors());

// Parse JSON requests
app.use(express.json());

// Initialize OpenAI with your API key
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Keeping the assistant ready
const careerAssistant = await openai.beta.assistants.retrieve(
    process.env.ASSISTANT_ID
);

// Set of basic questions
const setOfBasicQuestions = [
    "Let's just start with your introduction, name, age, and your passion",
    "Why do you want this counseling?",
    "Tell me what are your skills",
    "What skills do you want to develop?"
];


// Routes

// Create user
app.route('/api/users/create').post(async (req, res) => {
    try {
        const { userId } = req.body;

        // Check if the user already exists
        const existingUser = await User.findOne({ userId });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Create a new user without threadId
        const newUser = new User({
            userId,
        });

        // Save the user to the database
        const savedUser = await newUser.save();

        res.status(201).json(savedUser);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Find user
app.route('/api/users/:userId').get(async (req, res) => {
    try {
        const { userId } = req.params;

        // Find the user by userId
        const user = await User.findOne({ userId });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ userId: user.userId });
    } catch (error) {
        console.error('Error getting user info:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// List of all users
app.route('/api/users/all').get(async (req, res) => {
    try {
        const userList = await User.find();

        if (!userList) {
            return res.status(404).json({ error: 'UserList not found' });
        }

        res.status(200).json({ users: userList });
    } catch (error) {
        console.log("Error getting user list", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Delete user
app.route('/api/users/delete/:userId').delete(async (req, res) => {
    try {
        const { userId } = req.params;

        // Check if the user exists
        const existingUser = await User.findOne({ userId });
        if (!existingUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Delete the user
        await User.deleteOne({ userId });

        res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Create a thread of user
app.route('/api/thread/create').post(async (req, res) => {
    try {
        const userId = req.body.userId;

        // Check if the user exists
        const existingUser = await User.findOne({ userId });

        if (!existingUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Create a new thread
        const thread = await openai.beta.threads.create();

        // Get the thread ID
        const threadId = thread.id;

        // Update the user's threadId array
        const updatedUser = await User.findOneAndUpdate(
            { userId },
            { $push: { threadId: threadId } },
            { new: true } // Return the updated document
        );

        res.status(200).json({
            status: 'success',
            message: 'Thread created successfully',
            threadId,
            updatedUser
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error creating thread' });
    }
});

// Get threads of particular user
app.route('/api/thread/:userId').get(async (req, res) => {
    try {
        const userId = req.params.userId;

        // Find the user by userId
        const user = await User.findOne({ userId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Return the threadId array
        res.status(200).json({ threadId: user.threadId });
    } catch (error) {
        console.error('Error getting user threads:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//Delete thread of a user
app.route('/api/threads/delete/:userId/:threadId').delete(async (req, res) => {
    try {
        const { userId, threadId } = req.params;

        // Check if the user exists
        const existingUser = await User.findOne({ userId });

        if (!existingUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if the provided threadId matches any thread associated with the user
        if (!existingUser.threadId.includes(threadId)) {
            return res.status(404).json({ error: 'Thread not found for the user' });
        }

        // Delete the thread
        // await openai.beta.threads.delete(threadId);

        // Remove the threadId from the user
        await User.findOneAndUpdate(
            { userId },
            { $pull: { threadId: threadId } }
        );

        res.status(200).json({
            status: 'success',
            message: 'Thread deleted successfully',
            userId,
            threadId
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error deleting thread' });
    }
});



// Structure of object
/*
{
  id: 'msg_3BG1ISYa3VEeIed5Tv8dyoQW',
  object: 'thread.message',
  created_at: 1702925199,
  thread_id: 'thread_JCJw7PRiFcjjWoVcnNAephB9',
  role: 'user' | 'assistant',
  content: [ { type: 'text', text: [Object] } ],
  file_ids: [],
  assistant_id: null,
  run_id: null,
  metadata: {}
}
*/

//  Once I have threadId and userId
//  Now I need to use to create a message
app.route('/api/message/create').post(async (req, res) => {
    try {
        const userId = req.body.userId;

        // Check if the user exists
        const existingUser = await User.findOne({ userId });
        if (!existingUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if the thread exists
        const targetThreadId = req.body.threadId;
        if (!existingUser.threadId.includes(targetThreadId)) {
            return res.status(404).json({ error: 'Thread not found' });
        }

        // Create a message
        const prompt = req.body.prompt;
        if (!prompt) {
            return res.status(400).json({ error: 'prompt not found' });
        }

        console.log("Verified all the entries");

        const message = await openai.beta.threads.messages.create(targetThreadId, {
            role: 'user',
            content: prompt
        });

        // Create a run
        // It only creates a queued message
        const run = await openai.beta.threads.runs.create(targetThreadId, {
            assistant_id: careerAssistant.id,
            instructions: 'Keep the chat short and simple'
        });

        
        const checkStatus = async(threadId, runId) => {
            let runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);
            if (runStatus.status === 'completed'){
                let messages = await openai.beta.threads.messages.list(threadId);

                const response = {
                    role1: messages.data.reverse()[0].role,
                    content1: messages.data.reverse()[1].content[0].text.value,
                    role2: messages.data.reverse()[1].role,
                    content2: messages.data.reverse()[0].content[0].text.value
                };

                res.status(200).json({ success: true, response });
                
            }else{
                console.log("Run is not completed yet");
                res.status(200).json({ success: false, message: "Run is not completed yet" });
            }
        }

        setTimeout(()=>{
            checkStatus(targetThreadId, run.id)
        }, 10000);

    } catch (error) {
        console.error('Error creating message:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get all messages for a specific thread
app.route('/api/message/getAll/:userId/:threadId').get(async (req, res) => {
    try {
        const { userId, threadId } = req.params;

        // Check if the user exists
        const existingUser = await User.findOne({ userId });
        if (!existingUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if the provided threadId matches any thread associated with the user
        if (!existingUser.threadId.includes(threadId)) {
            return res.status(404).json({ error: 'Thread not found for the user' });
        }

        // Retrieve all messages for the specified thread
        let messages = await openai.beta.threads.messages.list(threadId);
        res.status(200).json({ status: 'success', messagesList: messages });
    } catch (error) {
        console.error('Error getting all user threads:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


//Discuss whether we need to store the deleted conversations?
//For now not deleting it, just delete threads


// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    connectDB(mongo_url);
    console.log(`Hi, I am your ${careerAssistant.name}`);
});
