const settings = require('../setting/settings'); // Fixed Path
const fs = require('fs');
const path = require('path');
const os = require('os');

function formatTime(seconds) {
    const days = Math.floor(seconds / (24 * 60 * 60));
    seconds = seconds % (24 * 60 * 60);
    const hours = Math.floor(seconds / (60 * 60));
    seconds = seconds % (60 * 60);
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);

    let time = '';
    if (days > 0) time += `${days}d `;
    if (hours > 0) time += `${hours}h `;
    if (minutes > 0) time += `${minutes}m `;
    if (seconds > 0 || time === '') time += `${seconds}s`;

    return time.trim();
}

async function helpCommand(sock, chatId, message) {
        const start = Date.now();
        await sock.sendMessage(chatId, { text: '*Loading 🔥....*' }, { quoted: message });
        const end = Date.now();
        const ping = Math.round((end - start) / 2);

        const uptimeInSeconds = process.uptime();
        const uptimeFormatted = formatTime(uptimeInSeconds);
    const helpMessage = `╔══════════════════════════════════╗
║        ☠ 𝗕𝗜𝗟𝗔𝗟 𝗠𝗗  ☠
╠══════════════════════════════════╣
║ 👑 Root User : ${settings.botOwner}
║ ⚡ Response : ${ping} ms
║ ⏳ Runtime  : ${uptimeFormatted}
║ 📅 System Time : ${new Date().toLocaleString()}
║ 🧠 Bot Version : v${settings.version}
║ 🟢 Server Status : ONLINE
╚══════════════════════════════════╝


┏━━━━━━━━━━〔 👑 ROOT CONTROL 〕━━━━━━━━━━┓
┃ ⦿ .ban        ⦿ .unban
┃ ⦿ .warn       ⦿ .warnings
┃ ⦿ .kick       ⦿ .mute
┃ ⦿ .unmute    ⦿ .promote
┃ ⦿ .demote    ⦿ .tagall
┃ ⦿ .delete     ⦿ .resetlink
┃ ⦿ .chatbot    ⦿ .antibadword
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛


┏━━━━━━━━━━〔 🌐 SYSTEM COMMANDS 〕━━━━━━━━━━┓
┃ ⦿ .menu       ⦿ .alive
┃ ⦿ .ping        ⦿ .jid
┃ ⦿ .admins     ⦿ .groupinfo
┃ ⦿ .weather    ⦿ .news
┃ ⦿ .tts         ⦿ .lyrics
┃ ⦿ .quote      ⦿ .fact
┃ ⦿ .joke        ⦿ .8ball
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛


┏━━━━━━━━━━〔 ⚙ BOT CONFIGURATION 〕━━━━━━━━━━┓
┃ ⦿ .mode public
┃ ⦿ .mode private
┃ ⦿ .autoread
┃ ⦿ .autoreact
┃ ⦿ .autobio
┃ ⦿ .autostatus
┃ ⦿ .antidelete
┃ ⦿ .clearsession
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛


┏━━━━━━━━━━〔 🧩 STICKER ENGINE 〕━━━━━━━━━━┓
┃ ⦿ .sticker
┃ ⦿ .take
┃ ⦿ .blur
┃ ⦿ .meme
┃ ⦿ .emojimix
┃ ⦿ .tgsticker
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛


┏━━━━━━━━━━〔 🎮 CYBER GAMES 〕━━━━━━━━━━┓
┃ ⦿ .truth
┃ ⦿ .dare
┃ ⦿ .trivia
┃ ⦿ .hangman
┃ ⦿ .guess
┃ ⦿ .tictactoe
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛


┏━━━━━━━━━━〔 🤖 AI CORE 〕━━━━━━━━━━┓
┃ ⦿ .gpt
┃ ⦿ .gptgo
┃ ⦿ .gemini
┃ ⦿ .flux
┃ ⦿ .imagine
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛


┏━━━━━━━━━━〔 🎨 LOGO GENERATOR 〕━━━━━━━━━━┓
┃ ⦿ .neon
┃ ⦿ .glitch
┃ ⦿ .fire
┃ ⦿ .ice
┃ ⦿ .matrix
┃ ⦿ .hacker
┃ ⦿ .blackpink
┃ ⦿ .1917
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛


┏━━━━━━━━━━〔 🔎 DATA SCRAPER 〕━━━━━━━━━━┓
┃ ⦿ .play
┃ ⦿ .song
┃ ⦿ .video
┃ ⦿ .ytmp4
┃ ⦿ .instagram
┃ ⦿ .tiktok
┃ ⦿ .facebook
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛


┏━━━━━━━━━━〔 💻 GITHUB TERMINAL 〕━━━━━━━━━━┓
┃ ⦿ .gitclone
┃ ⦿ .repo
┃ ⦿ .github
┃ ⦿ .script
┃ ⦿ .sc
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛


╔══════════════════════════════════╗
║  ⚡ ACCESS GRANTED
║  🖥 BILAL KING SYSTEM ACTIVE
║  🔐 WHATSAPP MD BILAL KING 
╚══════════════════════════════════╝`;
    try {
        const imagePath = path.join(__dirname, '../assets/bot_image.jpg');
        
        if (fs.existsSync(imagePath)) {
            const imageBuffer = fs.readFileSync(imagePath);
            
            await sock.sendMessage(chatId, {
                image: imageBuffer,
                caption: helpMessage,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363406434037642@newsletter',
                        newsletterName: '',
                        serverMessageId: -1
                    }
                }
            },{ quoted: message });
        } else {
            console.error('Bot image not found at:', imagePath);
            await sock.sendMessage(chatId, { 
                text: helpMessage,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363406434037642@newsletter',
                        newsletterName: '𝗕𝗜𝗟𝗔𝗟 𝗠𝗗',
                        serverMessageId: -1
                    } 
                }
            });
        }
    } catch (error) {
        console.error('Error in help command:', error);
        await sock.sendMessage(chatId, { text: helpMessage });
    }
}

module.exports = helpCommand;
