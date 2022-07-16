const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('authenticated', (session) => {    
    console.log('Authenticated');
});

client.on('message',async message => {
    let msg = message.body.toLowerCase();
    const chat = await message.getChat();
    // after 1 second :: send seen and send typing 
        client.sendSeen()
        chat.sendStateTyping(); 
        
    // after 3 seconds :: send message / reply to the message
    setTimeout(() => {
        if(msg === 'hi') {
            console.log(':)');
            message.reply('pong');
        }
        console.log(message.body); 

        // send extra message 
        setTimeout(() => {
            client.sendMessage(message.from, '~ bot message from uday');
        }, 3000);
    }, 3000);
});

client.initialize();