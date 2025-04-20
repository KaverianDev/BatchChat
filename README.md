# Command Chat
this is pretty much just a little funny chat app i made in batch

# PLEASE NOTE

this has no authentication AT ALL. people can flood the chatlogs like crazy, hell probably crash your server. this probably has like infinite vulnerabilities. PLEASE DO NOT USE ON A LARGE SCALE. only with your friends probably.
oh yeah and this chat client is really impractical. i advise you to go checkout sharp chat, however it's probably only gonna be a bit better than this but also have those vulnerabilites.

# Server-Side Setup
yeah so i asked ai to do this.. here is how you do it.
oh yeah and the instructions are for linux, figure it out windows fanboys!

so first you gotta have npm installed, and you gotta run this command

```bash
npm install express body-parser fs cors
```
now you got the dependencies ready, so youve gotta get the actual server ready.

now make a file, whatever you called but i advise you to make the file extension .js
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

// Endpoint to handle PATCH requests to send messages
app.patch('/chat', (req, res) => {
    const message = req.body.message;
    if (message) {
        fs.appendFile('messages.txt', message + '\n', (err) => {
            if (err) {
                console.error('Error saving message:', err);
                return res.status(500).send('Error saving message');
            }
            res.send('Message saved');
        });
    } else {
        res.status(400).send('No message provided');
    }
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

now your all done! happy chatting i guess

# Client-Side Setup
well there isn't really anything to do, other than download chat.bat from the repo.
