# Command Chat
this is pretty much just a little funny chat app i made in batch

# PLEASE NOTE

this has no authentication AT ALL. people can flood the chatlogs like crazy, hell probably crash your server. this probably has like infinite vulnerabilities. PLEASE DO NOT USE ON A LARGE SCALE. only with your friends probably.
oh yeah and this chat client is really impractical. i advise you to go checkout sharp chat, however it's probably only gonna be a bit better than this but also have those vulnerabilites. + the same server implementation

# Chat Commands

Client Commands:<br>
.e is exit, or you can just do ctrl+c<br>
.r is refresh, or just send a message<br>
.m goes to the menu<br>
<br>
Server Commands:<br>
/ver will show server logic version<br>
/clear to clear all messages (mod only)<br>
/stop to stop server (mod only)<br>
/reloadmods to reload all mods and tag untagged mods (mod only)<br>

# Server-Side Setup
yeah so i asked ai to do this.. here is how you do it.
oh yeah and the instructions are for linux, figure it out windows fanboys!

so first you gotta have npm installed, and you gotta run this command

```bash
npm install express body-parser fs cors axios
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

now there's one last thing left to do. port fowarding.
the default is port 3000, however at the start of the js code, theres a variable for the port, change that if you want to.

now all you gotta do is start the server! if everything was sucsessful, you should see "Server is running on http://localhost:3000", and if you changed the port then, it'll show that accordingly.
```bash
node chat.js
```
now your all done! happy chatting i guess

# How to Add Mods

this is pretty straightfoward, just type in mod (username here). howvere if you do not have terminal access, then you can find mods.json and just add a username (make sure you format it properly)<br>
now do reloadmods in the terminal (if you don't have access to the terminal, then just wait 30s



# Client-Side Setup
well there isn't really anything to do, other than download chat.bat from the latest release.
