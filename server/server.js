const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const crypto = require('crypto'); 

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.json());

let users = {};

function hashPassword(password){
    return crypto.createHash('sha256').update(password).digest('hex');
}

//Signup route
app.post('/signup', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).send('Username and password are required');
    }
  
    if (users[username]) {
      return res.status(400).send('User already exists');
    }
  
    const hashedPassword = hashPassword(password);
    users[username] = { username, password: hashedPassword };
    res.status(201).send('User created successfully');
  });
//Login route
  app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users[username];
  
    if (!user || user.password !== hashPassword(password)) {
      return res.status(401).send('Invalid username or password');
    }
  
    res.status(200).send('User logged in successfully');
  });

       

// Routes
app.get('/', (req, res) => {
  res.send('Chat Server is running!');
});

// Corrected the 'connection' event
io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
