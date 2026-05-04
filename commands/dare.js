const fetch = require('node-fetch');

async function dareCommand(sock, chatId, message) {
    try {
        const shizokeys = '𝗕𝗜𝗟𝗔𝗟 𝗠𝗗';
        const res = await fetch(`https://api.giftedtech.co.ke/api/fun/dares?apikey=gifted=${shizokeys}`);
        
        if (!res.ok) {
            throw await res.text();
        }
        
        const json = await res.json();
        const dareMessage = json.result;

        // Send the dare message
        await sock.sendMessage(chatId, { text: dareMessage }, { quoted: message });
    } catch (error) {
        console.error('Error in dare command:', error);
        await sock.sendMessage(chatId, { text: '❌ Failed to get dare. Please try again later!' }, { quoted: message });
    }
}

module.exports = { dareCommand };
