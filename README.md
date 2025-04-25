# BatchChat   
This is a simple Batch Chat Client created entirely in Batch. Forked from CMDChat

# PLEASE NOTE

This is really NOT meant for normal use, just use it for recreation. This has no authentication so I'm not responsible for any of the damages made by this.

# Chat Commands

.e is exit, or you can just do ctrl+c
.r is refresh, or just send a message
.m goes to the menu

# Server-Side Setup
yeah so i asked ai to do this.. here is how you do it.
oh yeah and the instructions are for linux, figure it out windows fanboys!

so first you gotta have npm installed, and you gotta run this command

```bash
npm install express body-parser fs cors
```
now you got the dependencies ready, so youve gotta get the actual server ready.

now make a file, preferably called chat.js, but you can name it anything ending in .js
now put this inside that file: (or just download it as a file)

```javascript
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors'); // Optional, if you need CORS
const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); // Enable CORS if necessary
app.use(bodyParser.json());

// In-memory store for rate limiting
const userTimestamps = {};

// Rate limit settings
const RATE_LIMIT_MS = 500; // 0.5 seconds

// Endpoint to handle PATCH requests to send messages
app.patch('/chat', (req, res) => {
    const { username, message } = req.body;

    // Check if username and message are provided
    if (!username || !message) {
        return res.status(400).send('Username and message are required');
    }

    const currentTime = Date.now();
    const lastMessageTime = userTimestamps[username] || 0;

    // Check rate limit
    if (currentTime - lastMessageTime < RATE_LIMIT_MS) {
        return res.status(429).send('Too many requests. Please wait before sending another message.');
    }

    // Update the last message time for the user
    userTimestamps[username] = currentTime;

    // Append the message to the file with the username in angle brackets
    fs.appendFile('messages.txt', `<${username}> ${message}\n`, (err) => {
        if (err) {
            console.error('Error saving message:', err);
            return res.status(500).send('Error saving message');
        }
        res.send('Message saved');
    });
});

// Endpoint to handle GET requests to retrieve messages
app.get('/chat', (req, res) => {
    fs.readFile('messages.txt', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading messages:', err);
            return res.status(500).send('Error reading messages');
        }
        res.send(data);
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

```

next, you gotta make the file for the messages, just create a file named messages.txt

now there's one last thing left to do. port fowarding.
the default is port 3000, however at the start of the js code, theres a variable for the port, change that if you want to.

now all you gotta do is start the server! if everything was sucsessful, you should see "Server is running on http://localhost:3000", and if you changed the port then, it'll show that accordingly.
```bash
node chat.js
```
now your all done! happy chatting i guess

# Client-Side Setup
well there isn't really anything to do, other than download chat.bat from the repo.
