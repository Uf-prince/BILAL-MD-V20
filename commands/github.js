async function githubCommand(sock, chatId) {
    const repoInfo = `*Vanta_M𝐝*

*Github:*
╭━━━❰⚡ *𝗕𝗜𝗟𝗔𝗟 𝗠𝗗 V1 IS HERE!* ⚡❱━━━╮  
┃  
┃ 🚀 *New Commands Unlocked!*  
┃ 🎮 Fun Menu  
┃ 📥 Download Menu  
┃ 👑 Owner Menu  
┃ 👥 Group Menu  
┃  
┃ 🔗 *Pair now & get FREE access to*  
┃ 💠 *500 Servers* – Limited slots!  
┃  
┃ 🤖 *Pair Using Any Server Below:*  
┃ ┗https://t.me/ajjeidnxoeodjnd
┃  
┃ ⏳ *Hurry before server is full!*  
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
Follow Rules and enjoy ✍️`;

    try {
        await sock.sendMessage(chatId, {
            text: repoInfo,
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
    } catch (error) {
        console.error('Error in github command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Error fetching repository information.' 
        });
    }
}

module.exports = githubCommand; 