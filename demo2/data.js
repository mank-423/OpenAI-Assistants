import OpenAI from "openai";
import yahooFinance from 'yahoo-finance2';
import dotenv from "dotenv";
import linkedIn from 'linkedin-jobs-api'

dotenv.config();
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
        limit: '5'
    };

    try {
        const response = await queryLinkedIn(queryOptions);
        return response;
    } catch (error) {
        console.error('Error getting LinkedIn jobs', error);
    }
}


async function getStockPrice(symbol) {
    try {
        const quote = await yahooFinance.quote(symbol);
        return { 
            symbol: symbol, 
            price: quote.regularMarketPrice, 
            currency: quote.currency 
        };
    } catch (error) {
        console.error(`Error fetching stock price for ${symbol}: ${error}`);
        throw error;
    }
}

// const tools = [
//     {
//         "type": "function",
//         "function": {
//             "name": "getStockPrice",
//             "description": "Get the current stock price of a company using its stock symbol",
//             "parameters": {
//                 "type": "object",
//                 "properties": {
//                     "symbol": {
//                         "type": "string",
//                         "description": "Stock symbol (e.g., 'AAPL' for Apple)"
//                     }
//                 },
//                 "required": ["symbol"]
//             }
//         }
//     }
// ];

const tools = [
    {
      type: 'function',
      function: {
        name: 'getLinkedInJobs',
        description: 'Get jobs from LinkedIn', 
        parameters: {
          type: 'object',
          properties: {} 
        }  
      }
    }
  ];

// Step 1: Define your assistant 
const assistant = await openai.beta.assistants.create({
    name: "Job finder",
    instructions:
        "You are helping user with perfect match of job",
    tools: tools,
    model: "gpt-3.5-turbo-16k",
});

// Step 2: Creating a thread and sending a message
const thread = await openai.beta.threads.create();

// Step 3: Create a message
const message = await openai.beta.threads.messages.create(thread.id, {
    role: "user",
    content: "Give me recent time job postings on LinkedIn",
});

// Step 4: Create a run with custom instructions
const run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: assistant.id,
    instructions: "Please address the user as Mayank Kumar.",    
});

console.log(run)

// Function to check run status and print messages
const checkStatusAndPrintMessages = async (threadId, runId) => {
    let runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);
    console.log(runStatus)    
    if(runStatus.status === "completed"){
        let messages = await openai.beta.threads.messages.list(threadId);
        messages.data.forEach((msg) => {
            const role = msg.role;
            const content = msg.content[0].text.value; 
            console.log(
                `${role.charAt(0).toUpperCase() + role.slice(1)}: ${content}`
            );
        });
        console.log("Run is completed.");
        clearInterval(intervalId);
    } else if (runStatus.status === 'requires_action') {
        console.log("Requires action");
    
        const requiredActions = runStatus.required_action.submit_tool_outputs.tool_calls;
        console.log(requiredActions);
    
        let toolsOutput = [];
    
        for (const action of requiredActions) {
            const funcName = action.function.name;
            //const functionArguments = JSON.parse(action.function.arguments);
            
            if (funcName === "getLinkedInJobs") {
                const output = await getLinkedInJobs();

                if (output && output.length > 0) {
                    console.log(output[0]);
                  } else {
                    console.log('No data returned from getLinkedInJobs');
                }

                toolsOutput.push({
                    tool_call_id: action.id,
                    output: JSON.stringify(output)  
                });
            } else {
                console.log("Function not found");
            }
        }
    
        // Submit the tool outputs to Assistant API
        await openai.beta.threads.runs.submitToolOutputs(
            thread.id,
            run.id,
            { tool_outputs: toolsOutput }
        );
    } 
    else {
        console.log("Run is not completed yet.");
    }  
};

const intervalId = setInterval(() => {
    checkStatusAndPrintMessages(thread.id, run.id)
}, 15000);