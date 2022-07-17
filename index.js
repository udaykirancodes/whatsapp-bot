// SERVER CODE  
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const dotenv = require('dotenv');
const path = require('path')
dotenv.config(); 

const socketIo = require('socket.io');  
const io = socketIo(server);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

app.use('/public', express.static(path.join(__dirname, 'public')))


server.listen(process.env.PORT, () => {
  console.log('Server Started');
});


// WEBJS BOT CODE 
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', qr => {
    qrcode.toDataURL(qr,(err,url)=>{
        console.log(url); // send url to frontend 
    })
    qrcode.generate(qr, {small: true});
});



client.on('authenticated', (session) => {    
    console.log('Authenticated');
});

client.on('message',async message => {
    if(!message.isGroup || !message.isForwarded){
        // after 3 seconds :: send message / reply to the message
        setTimeout(() => {
            send(message);
        }, 1000);
    }
});

client.initialize();

// Socket IO Starts 
io.on('connection',(socket)=>{
    socket.emit('message','Connecting To WhatsApp Web'); 

    // get & send qr code 
    client.on('qr', qr => {
        qrcode.toDataURL(qr,(err,url)=>{
            socket.emit('qrcode',url); 
            socket.emit('notification','QR Code Received. Scan Please...'); 
        })
        // qrcode.generate(qr, {small: true});
    });
    // send ready status 
    client.on('ready', () => {
        socket.emit('notification','WhatsApp Bot is Ready..'); 
    });
})


// function to reply 
const send = (message) => {
    let msg = message.body.toLowerCase();
    
    let hiText = ['hi','hello','hlo','hloo','hie'];
    let greetings = ['good morning','good night','good afternoon','gd mrng','gd night']
    

    

}

// function to send message as ~ bot message 
const sendOut = (message) => {
    setTimeout(() => {
        client.sendMessage(message.from, '~ bot message from Uday');
    }, 1000);
}