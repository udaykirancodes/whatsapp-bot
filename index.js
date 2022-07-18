// SERVER CODE  
const express = require('express'); 
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);


const dotenv = require('dotenv');
const path = require('path')
dotenv.config(); 

http.listen(process.env.PORT, function() {
   console.log('server started');
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});



app.use('/public', express.static(path.join(__dirname, 'public')))


// WEBJS BOT CODE 
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');

const client = new Client({
    authStrategy: new LocalAuth()
});


const state = {
    connected : false,
    totalChats : 0,
    groupChats : 0,
    wishes : 0,
    personalChats : 0
}

// Socket IO Starts 
io.on('connection',(socket)=>{
    console.log('User Connected'); 
    socket.emit('notification','Connecting To WhatsApp Web'); 
    socket.emit('notification',state); 
    // get & send qr code 
    client.on('qr', qr => {
        qrcode.toDataURL(qr,(err,url)=>{
            socket.emit('qrcode',url); 
            console.log(url); 
            socket.emit('notification','QR Code Received. Scan Please...'); 
        })
        qrcode.generate(qr, {small: true});
    });
    // send ready status 
    client.on('ready', () => {
        socket.emit('notification',state); 
        console.log('client is ready!'); 
    });
    
    
    client.on('authenticated', (session) => {  
        socket.emit('connected','connected'); 
        console.log('Authenticated');
    });

    client.on('message',async message => {
    if(!message.isGroup || !message.isForwarded){
        // after 1 second :: send message / reply to the message
        setTimeout(() => {
            send(message , socket);
            socket.emit('message',message.body); 
        }, 1000);
    }
});

})


// function to reply 
const send = (message , socket) => {
    let msg = message.body.toLowerCase();
    
    let hiText = ['hi','hello','hlo','hloo','hie'];
    let greetings = ['good morning','good night','good afternoon','gd mrng','gd night']

    message.reply('Hi'); 
    
    sendOut(message); 
}

// function to send message as ~ bot message 
const sendOut = (message) => {
    setTimeout(() => {
        client.sendMessage(message.from, '~ bot message from Uday');
    }, 1000);
}


client.initialize();
