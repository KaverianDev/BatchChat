const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
const axios = require('axios');
const readline = require('readline');
const os = require('os');
const app = express();
const PORT = 3000;

let CURRENT_VERSION = '1.3';

app.use(cors());
app.use(bodyParser.json());

const userTimestamps = {};
const RATE_LIMIT_MS = 500;

if (!fs.existsSync('messages.txt')) {
    fs.writeFileSync('messages.txt', '');
    console.log('Created missing messages.txt');
}

if (!fs.existsSync('mods.json')) {
    fs.writeFileSync('mods.json', JSON.stringify([], null, 2));
    console.log('Created missing mods.json');
}

let mods = [];
function loadMods() {
    try {
        mods = JSON.parse(fs.readFileSync('mods.json', 'utf8'));
        console.log('Mods reloaded:', mods.join(', '));
    } catch (error) {
        console.error('Error reading mods.json, using empty mod list.');
        mods = [];
    }
}
function saveMods() {
    fs.writeFileSync('mods.json', JSON.stringify(mods, null, 2));
}
loadMods();

console.log('Mods:', mods.join(', '));

async function checkForNewVersion() {
    try {
        const response = await axios.get('https://raw.githubusercontent.com/chicken-projects/cmdchat/main/serverversion', {
            responseType: 'text'
        });
        const latestVersion = typeof response.data === 'string' ? response.data.trim() : String(response.data).trim();
        if (latestVersion !== CURRENT_VERSION) {
            console.log(`\nA newer version (${latestVersion}) is available! Please update from version ${CURRENT_VERSION}.`);
        } else {
            console.log(`\nYou are using the latest version (${CURRENT_VERSION}).`);
        }
    } catch (error) {
        console.error('\nError checking for new version:', error.message);
    }
}


app.patch('/chat', (req, res) => {
    const uptime = Math.floor(process.uptime());
    const minutes = Math.floor(uptime / 60);
    const seconds = uptime % 60;
    const messageCount = fs.readFileSync('messages.txt', 'utf8').split('\n').filter(Boolean).length;
    let { username, message } = req.body;
    if (!username || !message) return res.status(400).send('Username and message are required');

    const currentTime = Date.now();
    const lastMessageTime = userTimestamps[username] || 0;
    if (currentTime - lastMessageTime < RATE_LIMIT_MS) {
        return res.status(429).send('Too many requests. Please wait before sending another message.');
    }
    userTimestamps[username] = currentTime;

    if (!message.startsWith('/')) {
        fs.appendFile('messages.txt', `<${username}> ${message}\n`, (err) => {
            if (err) return res.status(500).send('Error saving message');
            res.send('Message saved');
        });
        return;
    }

    if (message === '/ver') return res.send(`Server Version: ${CURRENT_VERSION}`);
    if (message === '/clear') {
        fs.writeFile('messages.txt', '', err => err ? res.status(500).send('Error clearing messages') : res.send('Messages cleared'));
        return;
    }
    if (message === '/stop') {
        res.send('Server is stopping...');
        console.log('Server is shutting down.');
        process.exit(0);
    }
    if (message === '/reloadmods') {
        loadMods();
        return res.send('Mods list reloaded.');
    }
    if (message.startsWith('/fakesay ')) {
        if (!mods.includes(username)) return res.status(403).send('You are not authorized to use /fakesay');
        const rest = message.slice(9).trim();
        const firstSpace = rest.indexOf(' ');
        if (firstSpace === -1) return res.status(400).send('Usage: /fakesay username message');
        const fakeUser = rest.substring(0, firstSpace);
        const fakeMessage = rest.substring(firstSpace + 1);
        fs.appendFile('messages.txt', `<${fakeUser}> ${fakeMessage}\n`, err => err ? res.status(500).send('Error saving fakesay message') : res.send('Fake message saved'));
        return;
    }
    if (message.startsWith('/mod ')) {
        if (!mods.includes(username)) return res.status(403).send('You are not authorized to use /mod');
        const targetUser = message.slice(5).trim();
        if (!targetUser) return res.status(400).send('Usage: /mod username');
        if (!mods.includes(targetUser)) {
            mods.push(targetUser);
            saveMods();
            return res.send(`User ${targetUser} has been added as a mod.`);
        } else {
            return res.send(`User ${targetUser} is already a mod.`);
        }
    }
    if (message.startsWith('/demod ')) {
        if (!mods.includes(username)) return res.status(403).send('You are not authorized to use /demod');
        const targetUser = message.slice(7).trim();
        if (!targetUser) return res.status(400).send('Usage: /demod username');
        if (mods.includes(targetUser)) {
            mods = mods.filter(mod => mod !== targetUser);
            saveMods();
            return res.send(`User ${targetUser} has been removed as a mod.`);
        } else {
            return res.send(`User ${targetUser} is not a mod.`);
        }
    }
    if (message === '/mods') {
        return res.send(`Mods: ${mods.join(', ')}`);
    }

    if (message === '/stats') {
        return res.send(`Uptime: ${minutes}m ${seconds}s
Messages: ${messageCount}`);
    }

    return res.status(400).send('Unknown command, type cmds for commands');
});

app.get('/chat', (req, res) => {
    fs.readFile('messages.txt', 'utf8', (err, data) => {
        if (err) return res.status(500).send('Error reading messages');
        res.send(data);
    });
});

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
let watching = false;

function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

function startWatchMode() {
    console.clear();
    watching = true;
    let lastContent = '';
    const interval = setInterval(() => {
        if (!watching) return clearInterval(interval);
        fs.readFile('messages.txt', 'utf8', (err, data) => {
            if (!watching) return;
            if (!err && data !== lastContent) {
                console.clear();
                console.log(data.trim());
                lastContent = data;
            }
        });
    }, 1000);

    process.stdin.setRawMode(true);
    process.stdin.resume();
    let buffer = '';
    process.stdin.on('data', chunk => {
        const str = chunk.toString();
        if (str === '\r') {
            const line = buffer.trim();
            buffer = '';
            console.log();
            if (line === 'exit') {
                watching = false;
                console.clear();
                console.log('Exited watch mode.');
                rl.prompt();
            } else if (line.startsWith('/')) {
                const [cmd, ...args] = line.slice(1).split(' ');
                switch (cmd) {
                    case 'say':
                        fs.appendFileSync('messages.txt', `<server> ${args.join(' ')}\n`);
                        break;
                    case 'fakesay':
                        if (args.length > 1) {
                            fs.appendFileSync('messages.txt', `<${args[0]}> ${args.slice(1).join(' ')}\n`);
                        } else {
                            console.log('Usage: /fakesay user message');
                        }
                        break;
                    case 'clear':
                        fs.writeFileSync('messages.txt', '');
                        break;
                    case 'stop':
                        console.log('Server is stopping...');
                        process.exit(0);
                    case 'reloadmods':
                        loadMods();
                        break;
                    default:
                        console.log('Unknown command, type cmds for commands');
                        break;
                }
            } else {
                fs.appendFileSync('messages.txt', `<server> ${line}\n`);
            }
        } else if (str === '\u0003') {
            process.exit();
        } else {
            buffer += str;
        }
    });
}

rl.on('line', (input) => {
    const [command, ...args] = input.trim().split(' ');
    switch (command) {
        case 'stats': {
            const uptime = Math.floor(process.uptime());
            const minutes = Math.floor(uptime / 60);
            const seconds = uptime % 60;
            const messageCount = fs.readFileSync('messages.txt', 'utf8').split('\n').filter(Boolean).length;
            console.log(`Uptime: ${minutes}m ${seconds}s
Messages: ${messageCount}`);
            break;
        }
        case 'ver':
            console.log(`Server Version: ${CURRENT_VERSION}`);
            break;
        case 'clear':
            fs.writeFile('messages.txt', '', err => err ? console.error('Error clearing messages:', err) : console.log('Messages cleared'));
            break;
        case 'stop':
            console.log('Server is stopping...');
            process.exit(0);
        case 'reloadmods':
            loadMods();
            console.log('Mods list reloaded.');
            break;
        case 'mod':
            if (args[0] && !mods.includes(args[0])) {
                mods.push(args[0]);
                saveMods();
                console.log(`User ${args[0]} has been added as a mod.`);
            } else {
                console.log(`User ${args[0]} is already a mod.`);
            }
            break;
        case 'demod':
            if (args[0] && mods.includes(args[0])) {
                mods = mods.filter(mod => mod !== args[0]);
                saveMods();
                console.log(`User ${args[0]} has been removed as a mod.`);
            } else {
                console.log(`User ${args[0]} is not a mod.`);
            }
            break;
        case 'mods':
            loadMods();
            console.log(`Mods: ${mods.join(', ')}`);
            break;
        case 'say':
            if (args.length > 0) {
                fs.appendFileSync('messages.txt', `<server> ${args.join(' ')}\n`);
                console.log(`Said: ${args.join(' ')}`);
            }
            break;
        case 'fakesay':
            if (args.length > 1) {
                fs.appendFileSync('messages.txt', `<${args[0]}> ${args.slice(1).join(' ')}\n`);
                console.log(`Faked: <${args[0]}> ${args.slice(1).join(' ')}`);
            }
            break;
        case 'watch':
            startWatchMode();
            return;
        case 'cmds':
            console.log('Available commands: ver, clear, stop, reloadmods, mod <user>, demod <user>, mods, say <msg>, fakesay <user> <msg>, watch');
            break;
        default:
            console.log('Unknown command, type cmds for commands');
            break;
    }
    if (!watching) rl.prompt();
});

const localIP = getLocalIP();
(async () => {
    await checkForNewVersion();
    app.listen(PORT, () => {
        console.log(`Server is running on http://${localIP}:${PORT}`);
        rl.prompt();
    });
})();
