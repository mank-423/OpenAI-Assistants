import OpenAI from "openai";
import dotenv from "dotenv";
import linkedIn from 'linkedin-jobs-api'


dotenv.config();

// instance
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });


const queryLinkedIn = async (queryOptions) => {
    try {
        const response = await linkedIn.query(queryOptions);
        return response;
    } catch (error) {
        console.error('Error querying LinkedIn jobs', error);
        throw error;
    }
}

async function getLinkedInJobs() {
    const queryOptions = {
        keyword: 'software engineer',
        location: 'India',
        dateSincePosted: 'past Week',
        jobType: 'full time',
        remoteFilter: 'remote',
        salary: '100000',
        experienceLevel: 'entry level',
        limit: '10'
    };

    try {
        const response = await queryLinkedIn(queryOptions);
        console.log(response);
    } catch (error) {
        console.error('Error getting LinkedIn jobs', error);
    }
}



// const assistant_config = {
//     name: "Career counsellor",
//     instructions: "You are a career counsellor. Help people with their career based problem. Also your replies are optimistic and positive, and you help the user to be positive.",
//     model: "gpt-3.5-turbo-16k",
//     tools: [
//         {
//             type: "function",
//             function: {
//                 name: "getLinkedInJobs",
//                 description: "Get jobs from LinkedIn using linkedin-jobs-api",
//                 parameters: {
//                     type: "object",
//                     properties: {
//                         queryOptions: {
//                             type: "object",
//                             properties: {
//                                 keyword: { type: "string", description: "Job role e.g. Software Developer" },
//                                 location: { type: "string", description: "Job location e.g. India, Remote" },
//                                 dateSincePosted: 'past Week',
//                                 jobType: { type: "string", description: "Either full time or part-time" },
//                                 remoteFilter: 'remote',
//                                 salary: '100000',
//                                 experienceLevel: 'entry level',
//                                 limit: '10'
//                             }
//                         }

//                     },
//                     required: [queryOptions]
//                 }
//             }
//         }
//     ]
// }

// Keeping the assistant ready
const codingTeacher = await openai.beta.assistants.retrieve(
    process.env.ASSISTANT_ID,
);

const thread = await openai.beta.threads.create();

const message = await openai.beta.threads.messages.create(thread.id, {
    role: "user",
    content: "Show me public job listing from linkedin for software engineer"
})

const run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: codingTeacher.id,
    instructions: "Address user as Mayank"
});

console.log(run)

const checkStatus = async (threadId, runId) => {
    let runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);
    if (runStatus.status === 'completed') {
        let messages = await openai.beta.threads.messages.list(threadId);
        messages.data.forEach((msg) => {
            const role = msg.role;
            const content = msg.content[0].text.value;
            console.log(
                `${role.charAt(0).toUpperCase() + role.slice(1)} : ${content}`
            );
        })
    }
    else if (runStatus.status === 'requires_action') {
        console.log("Requires action");
        const requiredActions = runStatus.required_action.submit_tool_outputs.tool_calls;
        console.log(requiredActions);

        let toolsOutput = [];

        for (const action of requiredActions) {
            const funcName = action.function.name;
            const functionArgument = JSON.parse(action.function.arguments);

            if (funcName === 'getStockPrice') {
                const output = await getLinkedInJobs();

                toolsOutput.push({
                    tool_call_id: action.id,
                    output: JSON.stringify(output)
                })
            } else {
                console.log("Unknown function");
            }
        }

        await openai.beta.threads.runs.submitToolsOutputs(
            threadId,
            runId,
            { toolsOutput: toolsOutput }
        )
    }
    else {
        console.log("Run is not completed yet");
    }
}

setTimeout(() => {
    checkStatus(thread.id, run.id)
}, 15000);