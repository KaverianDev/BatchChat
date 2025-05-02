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
