const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const crypto = require('crypto');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new socketIO.Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});

app.use(express.json());
app.use(cors());

// Function to hash the password
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// Users and their hashed passwords
let users = {
    'user1': { password: hashPassword('password1') },
    'user2': { password: hashPassword('password2') }
};

// Store online users with their socket IDs
let onlineUsers = {};

// Store chat room IDs for each pair of users
let chatRooms = {};

// Function to create a unique chat room ID based on usernames
function getChatRoomId(user1, user2) {
    return [user1, user2].sort().join('_');
}

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

// Socket.IO connection event
io.on('connection', (socket) => {
    console.log('New client connected : ${socket.id}');
    let currentUser;

    // Login user and set currentUser
    socket.on('login', (username) => {
        currentUser = username;
        onlineUsers[username] = socket.id;
        console.log(`${username} logged in with socket ID: ${socket.id}`);
    });

    // When a user requests to chat with another user
    socket.on('request chat', (otherUsername) => {
        if (onlineUsers[otherUsername]) {
            const chatRoomId = getChatRoomId(currentUser, otherUsername);
            socket.join(chatRoomId);
            chatRooms[currentUser] = chatRoomId;
            chatRooms[otherUsername] = chatRoomId;
            console.log(`${currentUser} and ${otherUsername} joined chat room: ${chatRoomId}`);
        } else {
            console.log(`Chat request failed: ${otherUsername} not found or not online.`);
        }
    });

    // When a user sends a message to the chat room
    // socket.on('send message', (messageText) => {
    //     const chatRoomId = chatRooms[currentUser];
    //     if (chatRoomId) {
    //         const message = { text: messageText, fromUsername: currentUser };
    //         io.to(chatRoomId).emit('receive message', message);
    //         console.log(`Message from ${currentUser} in room ${chatRoomId}: ${message.text}`);
    //     }
    // });

    socket.on('send message', (messageText) => {
        const chatRoomId = chatRooms[currentUser];
        if (chatRoomId) {
          const message = { text: messageText, fromUsername: currentUser };
          io.in(chatRoomId).emit('receive message', message);
          console.log(`Message from ${currentUser} in room ${chatRoomId}: ${message.text}`);
        }
      });
    // Handle disconnection
    socket.on('disconnect', () => {
        if (currentUser && onlineUsers[currentUser]) {
            delete onlineUsers[currentUser];
            delete chatRooms[currentUser];
            console.log(`${currentUser} disconnected`);
        } else {
            console.log('A user disconnected');
        }
    });
});

const port = process.env.PORT || 5000;
server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
