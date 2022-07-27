// SERVER CODE  
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);


const dotenv = require('dotenv');
const path = require('path')
dotenv.config();

http.listen(process.env.PORT, function () {
    console.log('server started');
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});



app.use('/public', express.static(path.join(__dirname, 'public')))


// WEBJS BOT CODE 
const { Client, RemoteAuth } = require('whatsapp-web.js');
const { MongoStore } = require('wwebjs-mongo');
const mongoose = require('mongoose');

const qrcode = require('qrcode');

const state = {
    connected: false,
    groupChats: 0,
    wishes: 0,
    personalChats: 0,
    notification: 'Connecting To WhatsApp Web'
}

mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log('Mongoose Connected');
    const store = new MongoStore({ mongoose: mongoose });
    const client = new Client({
        authStrategy: new RemoteAuth({
            store: store,
            backupSyncIntervalMs: 300000
        })
    });
    client.on('remote_session_saved', () => {
        console.log('Remote Auth Saved');
    })

    // Socket IO Starts 
    io.on('connection', (socket) => {
        console.log('User Connected');
        socket.emit('notification', state);

        socket.on('disconnect', () => {
            console.log('user disconnected');
        });
        // get & send qr code 
        client.on('qr', qr => {
            qrcode.toDataURL(qr, (err, url) => {
                socket.emit('qrcode', url);
                state.notification = 'QR Code Received. Scan Please...'
                socket.emit('notification', state);
            })
            // qrcode.generate(qr, { small: true });
        });
        // send ready status 
        client.on('ready', () => {
            state.notification = 'Bot is Ready!';
            state.connected = true
            socket.emit('notification', state);
            console.log('client is ready!');
        });


        client.on('authenticated', (session) => {
            state.connected = true;
            state.notification = 'Authenticated Successfully!';
            socket.emit('authenticated', state);
            console.log('Authenticated');
        });
        client.on('disconnected', (session) => {
            state.connected = false;
            state.notification = 'WhatsApp Bot Disconnected!!';
            socket.emit('notification', state);
            console.log('disconected');
        });

        client.on('message', async message => {
            let msg = message.body.toLowerCase();
            // waiting a second to get the latest chat 
            setTimeout(() => {
                const start = async () => {
                    let chat = await client.getChats()

                    console.log('isGroup :', chat[0].isGroup, 'Msg :', msg)
                    if (chat[0].isGroup) {
                        state.notification = 'Group Chat Received!!';
                        state.groupChats++;
                    }
                    if (msg.includes('hpy') || msg.includes('hbd') || msg.includes('happy') || msg.includes('birthday') || msg.includes('bornday') || msg.includes('bday')) {
                        state.notification = 'Someone Wished you!!';
                        state.wishes++;
                        chat[0].sendSeen()
                        chat[0].sendStateTyping();
                    }
                    if (!chat[0].isGroup || !chat[0].isForwarded) {
                        state.notification = 'Chat Received!!';
                        state.personalChats++;
                        send(message, socket);
                        chat[0].sendSeen()
                        chat[0].sendStateTyping();
                        // after 1 second :: send message / reply to the message
                    }
                    socket.emit('message', state);
                }
                start();
            }, 1000);
        });

    })
    client.initialize();
});






// function to reply 
const send = (message, socket) => {

    let msg = message.body.toLowerCase();

    let hiText = ['hi', 'hello', 'hlo', 'hloo', 'hie'];
    let greetings = ['good morning', 'good night', 'good afternoon', 'gd mrng', 'gd night']

    setTimeout(() => {
        message.reply('Hi');
    }, 2000);
    // sendOut(message); 
}

// function to send message as ~ bot message 
const sendOut = (message) => {
    setTimeout(() => {
        client.sendMessage(message.from, '~ bot message from Uday');
    }, 1000);
}


