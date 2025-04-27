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
now put this inside that file: (or just download it as a file above)

```javascript
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
const axios = require('axios');
const readline = require('readline');
const app = express();
const PORT = 3000;

const CURRENT_VERSION = '1.2';

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory stores
const userTimestamps = {}; // For rate limiting
const RATE_LIMIT_MS = 500;

// Ensure messages.txt exists
if (!fs.existsSync('messages.txt')) {
    fs.writeFileSync('messages.txt', '');
    console.log('Created missing messages.txt');
}

// Ensure mods.json exists (optional handling)
if (!fs.existsSync('mods.json')) {
    fs.writeFileSync('mods.json', JSON.stringify(['chicken', 'admin'], null, 2));
    console.log('Created missing mods.json');
}

// Load mods from mods.json
let mods = [];
function loadMods() {
    try {
        mods = JSON.parse(fs.readFileSync('mods.json', 'utf8'));
        console.log('Mods reloaded:', mods.join(', '));
    } catch (error) {
        console.error('Error reading mods.json, using default mods list.');
        mods = ['chicken', 'admin'];
    }
}
function saveMods() {
    fs.writeFileSync('mods.json', JSON.stringify(mods, null, 2));
}
loadMods();

// Show list of mods on startup
console.log('Mods:', mods.join(', '));

// Function to check for a newer version
async function checkForNewVersion() {
    try {
        const response = await axios.get('https://raw.githubusercontent.com/chicken-projects/cmdchat/refs/heads/main/serverversion', {
            responseType: 'text' // Force axios to treat it as plain text
        });

        const latestVersion = typeof response.data === 'string' ? response.data.trim() : String(response.data).trim();

        if (latestVersion !== CURRENT_VERSION) {
            console.log(`A newer version (${latestVersion}) is available! Please update from version ${CURRENT_VERSION}.`);
        } else {
            console.log(`You are using the latest version (${CURRENT_VERSION}).`);
        }
    } catch (error) {
        console.error('Error checking for new version:', error.message);
    }
}


// Check for a new version when the server starts
checkForNewVersion();

// Endpoint to handle PATCH requests to send messages
app.patch('/chat', (req, res) => {
    let { username, message } = req.body;

    if (!username || !message) {
        return res.status(400).send('Username and message are required');
    }

    const currentTime = Date.now();
    const lastMessageTime = userTimestamps[username] || 0;

    if (currentTime - lastMessageTime < RATE_LIMIT_MS) {
        return res.status(429).send('Too many requests. Please wait before sending another message.');
    }

    userTimestamps[username] = currentTime;

    // Commands
    if (message.trim() === '/ver') {
        return res.send(`Server Version: ${CURRENT_VERSION}`);
    }

    if (message.trim() === '/clear') {
        fs.writeFile('messages.txt', '', (err) => {
            if (err) {
                console.error('Error clearing messages:', err);
                return res.status(500).send('Error clearing messages');
            }
            return res.send('Messages cleared');
        });
        return;
    }

    if (message.trim() === '/stop') {
        res.send('Server is stopping...');
        console.log(`Server is shutting down.`);
        process.exit(0);
    }

    if (message.trim() === '/reloadmods') {
        loadMods();
        return res.send('Mods list reloaded.');
    }

    // Save normal message (username is displayed as is)
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

// Terminal input for commands (no mod requirement)
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('line', (input) => {
    const [command, user] = input.trim().split(' ');

    // Terminal commands without mod check
    if (command === 'ver') {
        console.log(`Server Version: ${CURRENT_VERSION}`);
    } else if (command === 'clear') {
        // Clear messages (anyone can do this)
        fs.writeFile('messages.txt', '', (err) => {
            if (err) {
                console.error('Error clearing messages:', err);
            } else {
                console.log('Messages cleared');
            }
        });
    } else if (command === 'stop') {
        console.log('Server is stopping...');
        process.exit(0);
    } else if (command === 'reloadmods') {
        loadMods();
        console.log('Mods list reloaded.');
    } else if (command === 'mod' && user) {
        if (!mods.includes(user)) {
            mods.push(user);
            saveMods();
            console.log(`User ${user} has been added as a mod.`);
        } else {
            console.log(`User ${user} is already a mod.`);
        }
    } else if (command === 'demod' && user) {
        if (mods.includes(user)) {
            mods = mods.filter(mod => mod !== user);
            saveMods();
            console.log(`User ${user} has been removed as a mod.`);
        } else {
            console.log(`User ${user} is not a mod.`);
        }
    } else if (command === 'mods') {
        loadMods();  // Ensure mods are loaded before displaying
        console.log(`Mods: ${mods.join(', ')}`);
    } else {
        console.log('Unknown command. Use "ver", "clear", "stop", "reloadmods", "mod username", or "demod username"');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
```

now there's one last thing left to do. port fowarding.
the default is port 3000, however at the start of the js code, theres a variable for the port, change that if you want to.

now you just got to start the server, here is the command to start it
```bash
node chat.js
```
and everything *should* go perfectly fine, but you can create an issue if you need to, i'll respond within a day.

now your all done! happy chatting i guess

# How to Add Mods

this is pretty straightfoward, just type in mod (username here). howvere if you do not have terminal access, then you can find mods.json and just add a username (make sure you format it properly)<br>
now do reloadmods in the terminal (if you don't have access to the terminal, then just wait 30s



# Client-Side Setup
well there isn't really anything to do, other than download chat.bat from the latest release.
