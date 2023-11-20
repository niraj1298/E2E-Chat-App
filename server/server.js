const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const crypto = require('crypto'); 
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.json());
app.use(cors());

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

let users = {
    'user1': { password: hashPassword('password1') },
    'user2': { password: hashPassword('password2') }
};

let onlineUsers = {}; // Stores online users' socket IDs

// Signup route
app.post('/signup', (req, res) => {
    const { username, password } = req.body;
    if (users[username]) {
        return res.status(400).send('Username already exists');
    }
    users[username] = { password: hashPassword(password) };
    res.status(200).send('Signup successful');
});

// Login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (!users[username] || users[username].password !== hashPassword(password)) {
        return res.status(400).send('Invalid username or password');
    }
    res.status(200).send('Login successful');
});

// Endpoint to get the username
app.get('/api/getUsername', (req, res) => {
    const loggedInUsername = req.query.loggedInUsername;
    if (loggedInUsername && users[loggedInUsername]) {
      res.json({ username: loggedInUsername });
    } else {
      res.status(404).send('Username not found');
    }
  });

  app.get('/users/:name', (req, res) => {
    const name = req.params.name;
    const user = users[name];
    if (user) {
      res.json({ name });
    } else {
      res.status(404).send('User not found');
    }
  });


// Socket.IO connection event
io.on('connection', (socket) => {
    console.log('New client connected');

    // Associate a username with the socket ID
    socket.on('login', username => {
        onlineUsers[username] = socket.id;
        console.log(`${username} connected with socket ID: ${socket.id}`);
    });

    // Handle direct messages
    socket.on('direct message', ({ toUsername, message }) => {
        if (onlineUsers[toUsername]) {
            io.to(onlineUsers[toUsername]).emit('direct message', { message, fromUsername: socket.id });
            console.log(`Message sent from ${socket.id} to ${toUsername}: ${message}`);
        } else {
            console.log(`Direct message failed: ${toUsername} not found`);
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        let disconnectedUser;
        for (let username in onlineUsers) {
            if (onlineUsers[username] === socket.id) {
                disconnectedUser = username;
                delete onlineUsers[username];
                break;
            }
        }
        console.log(`${disconnectedUser || 'A user'} disconnected`);
    });
});

const port = process.env.PORT || 5000;
server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
