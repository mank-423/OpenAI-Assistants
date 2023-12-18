import OpenAI from "openai";
import dotenv from "dotenv"
dotenv.config();

// instance
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Keeping the assistant ready
const codingTeacher = await openai.beta.assistants.retrieve(
    process.env.ASSISTANT_ID
);

const thread = await openai.beta.threads.create();

const message = await openai.beta.threads.messages.create(thread.id,{
    role: "user",
    content: "Tell me about trees"
})

const run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: codingTeacher.id,
    instructions: "Address user as Mayank"
});

console.log(run)

const checkStatus = async(threadId, runId) => {
    let runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);
    if (runStatus.status === 'completed'){
        let messages = await openai.beta.threads.messages.list(threadId);
        messages.data.forEach((msg)=>{
            const role = msg.role;
            const content = msg.content[0].text.value;
            console.log(
                `${role.charAt(0).toUpperCase() + role.slice(1)} : ${content}`
            );
        })
    }else{
        console.log("Run is not completed yet");
    }
}

setTimeout(()=>{
    checkStatus(thread.id, run.id)
}, 10000);