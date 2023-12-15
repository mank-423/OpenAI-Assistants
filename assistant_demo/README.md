# How the code works

- I have kept all my Id's in .env file for security purpose, and also covered it in my images.
- To start using this project, go to the root of folder and type
~
```
npm install
```

### Creating an assistant
- The first code with no. 1 as comments shows how to create a new assistant with your own touch to it.

- To create such assistant, get the code for it and run the file

```
node filename.js
```
<img width="802" alt="Screenshot 2023-12-15 123250" src="https://github.com/mank-423/OpenAI-Assistants/assets/96490105/56d6e23c-5565-47aa-876a-fa7a2185a838">


### Retreiving an assistant
- The second code tells the way on how to retreive an assistant back with it's id.

- You can also store the id of the assistant in DB, to access further.

```
node filename.js
```
<img width="748" alt="Screenshot 2023-12-15 123828" src="https://github.com/mank-423/OpenAI-Assistants/assets/96490105/be2b7cfe-82f0-4de9-b95c-45ea10b4c067">


### Creating a new thread
- Also you can store the thread, and assistant id, to fetch later on to get the sessions
- Comments clearly specify in index.js how to create a new thread
<img width="750" alt="Screenshot 2023-12-15 124125" src="https://github.com/mank-423/OpenAI-Assistants/assets/96490105/178b23fa-35e0-44e8-a70d-cec54d1aa12e">


### Creating a new message
- Create a new message and run and it gives the status of 'queued' at first.
<img width="757" alt="Screenshot 2023-12-15 125346" src="https://github.com/mank-423/OpenAI-Assistants/assets/96490105/1f62f913-8bc3-47d9-9cb4-375cb677a771">

- Then after litte time it gives the status as 'completed' meaning the message is also generated.
<img width="750" alt="Screenshot 2023-12-15 130009" src="https://github.com/mank-423/OpenAI-Assistants/assets/96490105/037d92ed-21eb-488c-8348-94b1735ac6b6">

### Accessing the message from the object
- The forEach loop under comment no.6 shows how to fetch the messages.
<img width="759" alt="Screenshot 2023-12-15 130707" src="https://github.com/mank-423/OpenAI-Assistants/assets/96490105/b080600b-307c-447d-bc9e-7404dade01ec">

### Fetching logs
<img width="350" alt="Screenshot 2023-12-15 131553" src="https://github.com/mank-423/OpenAI-Assistants/assets/96490105/3b70f987-ac86-448e-a202-6ff4a87b9c8d">
