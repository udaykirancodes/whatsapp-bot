// SERVER CODE  
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

// DOT ENV 
const dotenv = require('dotenv');
const path = require('path')
dotenv.config();
let PASSWORD = process.env.PASSWORD;

// SERVER LISTENING 
http.listen(process.env.PORT, function () {
    console.log('Server Started');
});

// ROUTES 
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});




// WEBJS BOT CODE 
const { MongoStore } = require('wwebjs-mongo');
const mongoose = require('mongoose');

const qrcode = require('qrcode');

const state = {
    connected: false,
    groupChats: 0,
    wishes: 0,
    personalChats: 0,
    notification: ''
}

const { Client, RemoteAuth } = require('whatsapp-web.js');



const store = new MongoStore({ mongoose: mongoose });
let clientCount = 0;
const client = new Client({
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true
    },
    authStrategy: new RemoteAuth({
        store: store,
        backupSyncIntervalMs: 300000
    })
});
let socketter;
mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log('DB Connected !!');
    if (clientCount === 0) {
        console.log('Initializing the Client !!');
        client.initialize();
        // console.log(clientCount);
        clientCount++;
    }
    io.on('connection', (socket) => {
        socketter = socket;
        console.log('User Connected !!');
        socketSender('notification', 'Connecting to Web Whatsapp Bot !!');
        // get & send qr code 
    })
    client.on('remote_session_saved', () => {
        console.log('Remote Auth Saved');
    })
    client.on('ready', () => {
        state.notification = 'Bot is Ready!';
        state.connected = true
        socketSender('notification', 'Bot is Ready !!');
        console.log('client is ready!');
    });
    client.on('authenticated', (session) => {
        socketSender('notification', 'Authented Successfully !!');
        console.log('Authenticated');
    });
    client.on('disconnected', (session) => {
        state.connected = false;
        socketSender('notification', 'Client Disconnected !!');
        console.log('disconected');
        client.initialize();
    });
    client.on('qr', qr => {
        console.log('QR Code Sent!!')
        socketSender('notification', 'Qr Code Sent , Please Scan !!');
        qrcode.toDataURL(qr, (err, url) => {
            socketter.emit('qrcode', url);
        })
    });
    client.on('message', async message => {
        if (message.isForwarded) {
            socketSender('notification', 'Forwarded Message Received !!');
        }
        if (message.from.endsWith('@c.us')) {
            state.personalChats++;
            send(message, client);
        }
        else {
            state.groupChats++;
            socketSender('notification', 'Group Chat Received !!');
        }
    })


})


const socketSender = (emitingEvent, notification) => {
    state.notification = notification;
    socketter.emit(emitingEvent, state);
    setTimeout(() => {
        state.notification = '...';
    }, 1000);
}

// seperate function to reply 
const send = async (message, client) => {
    let msg = message.body.toLowerCase();
    //console.log(msg);
    let hiText = ['hi', 'hello', 'hlo', 'hloo', 'hie', 'hii'];
    let greetings = ['good morning', 'good night', 'good afternoon', 'gd mrng', 'gd night']
    socketSender('notification', 'Chat Received');
    let chat = await client.getChats();
    if (msg == '🥰' || msg === '🥳' || msg === '🥰' || msg === '😘' || msg === '😍' || msg === '🤩' || msg === '🥳' || msg === '❤️' || msg === '⚡' || msg === '🔥' || msg === '🤍' || msg === '🖤' || msg === '💥') {
        chat[0].sendSeen()
        chat[0].sendStateTyping();
        setTimeout(() => {
            message.reply(msg);
        }, 1000);
    }
    else if (msg.includes('hpy') || msg.includes('hbd') || msg.includes('happy') || msg.includes('birthday') || msg.includes('bornday') || msg.includes('bday')) {
        socketSender('notification', 'Someone Wished Uday !!');
        state.wishes++;
        chat[0].sendSeen()
        chat[0].sendStateTyping();
        setTimeout(() => {
            message.reply('Thankyou ❤️');
            return;
        }, 1000);
        sendOut(message, client);
        return;
    }
    else if (msg == 'hi' || msg == 'hlo' || msg.includes('hi') || msg == 'hello' || msg == 'helo' || msg.includes('hlo')) {
        chat[0].sendSeen()
        chat[0].sendStateTyping();
        setTimeout(() => {
            message.reply('Hey! Hi👋');
            return;
        }, 1000);
        sendOut(message, client);
        return;
    }
}

// function to send message as ~ bot message 
const sendOut = (message, client) => {
    setTimeout(() => {
        client.sendMessage(message.from, '~ bot message from Uday');
    }, 1000);
}







// SERVING STATIC 
app.use('/public', express.static(path.join(__dirname, 'public')));

// ROUTE TO LOGOUT :: PASSWORD
app.get('/destroy/:password', (req, res) => {
    try {
        let pass = req.params.password;
        if (pass === PASSWORD) {
            client.destroy();
            res.send('success');
        }
        else {
            res.send('wrong password');
        }
    } catch (error) {
        res.send('Something went wrong !')
    }
})
// ROUTE TO RESTART THE CLIENT :: PASSWORD 
app.get('/restart/:password', (req, res) => {
    try {
        let pass = req.params.password;
        if (pass === PASSWORD) {
            client.initialize();
            res.send('success');
        }
        else {
            res.send('wrong password');
        }
    } catch (error) {
        res.send('Something went wrong !')
    }
})
// ROUTE TO RESTART THE CLIENT :: PASSWORD 
app.get('/logout/:password', (req, res) => {
    try {
        let pass = req.params.password;
        if (pass === PASSWORD) {
            client.logout();
            res.send('success');
        }
        else {
            res.send('wrong password');
        }
    } catch (error) {
        res.send('Something went wrong !')
    }
})
