const express=require('express')
const cors=require('cors')
const bodyParser=require('body-parser')
const connectDb=require('./config/db')
const route=require('./routes/route')
const http=require('http')
const socketIo=require('socket.io')
connectDb()
const app=express()
app.use(cors())
const server=http.createServer(app)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))






app.use('/hi', (req, res, next) => {
  req.io = io; // Attach Socket.IO to the request object
  next();
});

app.listen(process.env.PORT||5000,()=>{
    console.log(`Express is running on port ${process.env.PORT || 5000}`)
})

const io=socketIo(server)

//app.use('/api',route)
io.on('connection', (socket) => {
  console.log('A user connected');

  // When a user joins a room
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
  });

  // Handle other socket events here

  // When a user disconnects
  socket.on('disconnect', () => {
    console.log('A user disconnected');
    // Handle user disconnection, leave rooms, and cleanup as needed
  });
  

});