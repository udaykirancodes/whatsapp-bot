// const app = require('express')();
// const http = require('http').Server(app);
// const io = require('socket.io')(http);

// app.get('/', function(req, res) {
//    res.sendFile(__dirname +'/views/index.html');
// });

// //Whenever someone connects this gets executed
// io.on('connection', function(socket) {
//    console.log('A user connected');

//    //Whenever someone disconnects this piece of code executed
//    socket.on('disconnect', function () {
//       console.log('A user disconnected');
//    });
// });

// http.listen(3000, function() {
//    console.log('listening on *:3000');
// });

msg = 'Happy Birthday'
msg = msg.toLowerCase();
console.log(msg.includes('hpy')||msg.includes('happy'));