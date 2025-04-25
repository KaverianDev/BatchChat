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
