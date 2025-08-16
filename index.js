const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

const PORT = 3001;

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('send-changes', (data) => {
    // Broadcast text changes to all other users
    socket.broadcast.emit('receive-changes', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.get('/', (req, res) => {
  res.send('Server is running!');
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
