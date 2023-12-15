import { OpenAI } from 'openai'
import * as dotenv from 'dotenv'

//For .env variables
dotenv.config();

//One enviroment of openai
const openai = new OpenAI({
    apiKey: process.env.OPEN_AI_KEY,
})

// 1. Create new assistant
// const codingInstructor = 
// await openai.beta.assistants.create({
//     name: "Coding instructor",
//     instructions: "You are a coding instructor to school students.",
//     tools:[{
//         type: "code_interpreter",
//     }],
//     model: "gpt-3.5-turbo-1106"
// })

// 2. Retrieve old assistants with id
//  Here I am using career counsellor which is different from the above created one
const assistant = await openai.beta.assistants.retrieve(
    process.env.ASSISTANT_ID
);

// console.log(assistant)


// 3. Creating threads
//      - All you need to do is create a thread
//      - Store it's id in DB
//      - Fetch it whenever u want to, for getting the chats back

// const thread = await openai.beta.threads.create();
// console.log(thread);


// 4. Creating messages
// const message = await openai.beta.threads.messages.create(thread.id, {
//     role: "user",
//     content: "Which jobs are suited for me if I like machine learning and web devlopment?"
// })

//      Now after we create message we need to run the assitant
// const run = await openai.beta.threads.runs.create(thread.id, {
//     assistant_id: assistant.id,
//     instructions: "Address the user as Mayank"
// })
// console.log(run);
// This gives the run as status of queued


// 5. Retreival of status of message created and response from ai

// Now retreival of the run when status gets to completed
// This shows that message is generated and could be shown now
// const run = await openai.beta.threads.runs.retrieve(
//      process.env.THREAD_ID, //Thread_id 
//      process.env.RUN_ID, //Run_id
// )

// console.log(run);

// 6. Getting the messages from the thread to show
// const messages = await openai.beta.threads.messages.list(
//     process.env.THREAD_ID,
// )

// messages.body.data.forEach((message)=> {
//     console.log(message.content);
// })
// console.log(messages);


// 7. Fetch logs
const logs = await openai.beta.threads.runs.steps.list(
    process.env.THREAD_ID,
    process.env.RUN_ID,
);

logs.body.data.forEach(log =>
    console.log(log.step_details)
);

