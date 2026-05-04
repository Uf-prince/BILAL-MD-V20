const settings = require("../settings");
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { tmpdir } = require('os');

async function downloadImage(url) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const tempPath = path.join(tmpdir(), `zuko_alive_${Date.now()}.jpg`);
        await fs.promises.writeFile(tempPath, response.data);
        return tempPath;
    } catch (error) {
        console.error('Error downloading image:', error);
        return null;
    }
}

async function aliveCommand(sock, chatId) {
    try {
        const message = `
╭━━━━━━━━━━━━━━━━━━━╮
┃          𝗕𝗜𝗟𝗔𝗟 𝗠𝗗
╰━━━━━━━━━━━━━━━━━━━╯
┌───────────────────┐
│  🔹 *Status*: Online
│  🔸 *Version*: ${settings.version}
│  🔹 *Mode*: Public
├───────────────────
`.trim();

        const imageUrl = 'https://files.catbox.moe/e16jwg.bin';
        const imagePath = await downloadImage(imageUrl);
        
        const messageOptions = {
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363406434037642@newsletter,
                    newsletterName: '𝗕𝗜𝗟𝗔𝗟 𝗠𝗗',
                    serverMessageId: -1
                }
            }
        };

        if (imagePath) {
            try {
                messageOptions.image = fs.readFileSync(imagePath);
                messageOptions.caption = message;
            } finally {
                // Clean up the downloaded image
                fs.unlink(imagePath, () => {});
            }
        } else {
            messageOptions.text = message;
        }

        await sock.sendMessage(chatId, messageOptions);
    } catch (error) {
        console.error('Error in alive command:', error);
        await sock.sendMessage(chatId, { 
            text: '╭━━━━━━━━━━━╮\n┃ ❗ Error ┃\n╰━━━━━━━━━━━╯\nBot is active but status unavailable' 
        });
    }
}

module.exports = aliveCommand;
