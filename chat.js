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
