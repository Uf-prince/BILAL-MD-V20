const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const startpairing = require('./pair'); // Import your pair.js module

// Replace with your actual bot token from @BotFather
const BOT_TOKEN = '8761346277:AAHK-ZW0BiFhNuRNjU_YPtT3ztQIWrSKuXs';
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Admin user IDs who can use the bot (replace with actual Telegram user IDs)
const ADMIN_IDS = [7615067790]; // Add your admin Telegram user IDs here

// Store active pairing sessions
const activeSessions = new Map();

// Helper function to check if user is admin
function isAdmin(userId) {
    return ADMIN_IDS.includes(userId);
}

// Helper function to validate phone number
function validatePhoneNumber(text) {
    // Check for letters
    if (/[a-z]/i.test(text)) {
        return { valid: false, error: '❌ Letters are not allowed. Enter digits only.' };
    }

    // Check format (7-15 digits, optionally with |code)
    if (!/^\d{7,15}(\|\d{1,10})?$/.test(text)) {
        return { 
            valid: false, 
            error: '❌ Invalid format. Use: `923078071982` or `923078071982|1234`' 
        };
    }

    // Check if starts with 0
    if (text.startsWith('0')) {
        return { valid: false, error: '❌ Numbers starting with 0 are not allowed.' };
    }

    // Check restricted country codes
    const countryCode = text.slice(0, 3);
    if (["252", "201"].includes(countryCode)) {
        return { 
            valid: false, 
            error: "❌ Sorry, numbers with this country code are not supported." 
        };
    }

    return { valid: true };
}

// Helper function to get all session folders
function getSessionFolders() {
    const sessionsPath = './IGRIS-XD/pairing/';
    try {
        if (!fs.existsSync(sessionsPath)) {
            fs.mkdirSync(sessionsPath, { recursive: true });
            return [];
        }
        return fs.readdirSync(sessionsPath).filter(folder => {
            const folderPath = path.join(sessionsPath, folder);
            return fs.statSync(folderPath).isDirectory() && folder !== 'pairing.json';
        });
    } catch (error) {
        console.error('Error reading sessions folder:', error);
        return [];
    }
}

// Helper function to delete session folder
function deleteSessionFolder(phoneNumber) {
    const sessionPath = `./IGRIS-XD/pairing/${phoneNumber}`;
    try {
        if (fs.existsSync(sessionPath)) {
            deleteFolderRecursive(sessionPath);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error deleting session folder:', error);
        return false;
    }
}

// Recursive folder deletion function (same as in your pair.js)
function deleteFolderRecursive(folderPath) {
    if (fs.existsSync(folderPath)) {
        fs.readdirSync(folderPath).forEach(file => {
            const curPath = path.join(folderPath, file);
            fs.lstatSync(curPath).isDirectory() ? deleteFolderRecursive(curPath) : fs.unlinkSync(curPath);
        });
        fs.rmdirSync(folderPath);
    }
}

// 📌 Store users in JSON file (inside project folder)
const userFilePath = path.join(process.cwd(), "users.json");

// ✅ Load users
function loadUsers() {
    try {
        if (!fs.existsSync(userFilePath)) {
            fs.writeFileSync(userFilePath, JSON.stringify({}));
        }
        return JSON.parse(fs.readFileSync(userFilePath));
    } catch (err) {
        console.error("❌ Error loading users:", err);
        return {};
    }
}

// ✅ Save users
function saveUsers(users) {
    try {
        fs.writeFileSync(userFilePath, JSON.stringify(users, null, 2));
    } catch (err) {
        console.error("❌ Error saving users:", err);
    }
}

// Start command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const welcomeMessage = `╔═════〔 🤖 𝗕𝗜𝗟𝗔𝗟 𝗠𝗗 𝘽𝙊𝙏 〕═════╗
┃ ✦ 𝙋𝙊𝙒𝙀𝙍𝙀𝘿 𝘽𝙔 𝗕𝗜𝗟𝗔𝗟 𝗞𝗜𝗡𝗚   🚀
╚══════════════════════╝

┏━━〔 📊 𝘽𝙊𝙏 𝙄𝙉𝙁𝙊 〕━━┓
┃ 🧩 𝙉𝙖𝙢𝙚   : 𝗕𝗜𝗟𝗔𝗟 𝗠𝗗
┃ ⚡ 𝙎𝙩𝙖𝙩𝙪𝙨 : 🟢 𝘼𝘾𝙏𝙄𝙑𝙀
┃ 🧠 𝙏𝙮𝙥𝙚   : 𝙒𝙝𝙖𝙩𝙨𝘼𝙥𝙥 𝘽𝙤𝙩
┃ 🔐 𝙎𝙚𝙘𝙪𝙧𝙞𝙩𝙮 : 𝙃𝙞𝙜𝙝
┗━━━━━━━━━━━━━━━┛

┏━━〔 📖 𝘿𝙀𝙎𝘾𝙍𝙄𝙋𝙏𝙄𝙊𝙉 〕━━┓
┃ ✦ 𝗕𝗜𝗟𝗔𝗟 𝗠𝗗 𝙞𝙨 𝙖 𝙛𝙖𝙨𝙩 ⚡
┃ ✦ 𝙎𝙚𝙘𝙪𝙧𝙚 🔐 & 𝙍𝙚𝙡𝙞𝙖𝙗𝙡𝙚
┃ ✦ 𝙎𝙢𝙖𝙧𝙩 🤖 𝙒𝙝𝙖𝙩𝙨𝘼𝙥𝙥
┃ ✦ 𝘽𝙤𝙩 𝙎𝙮𝙨𝙩𝙚𝙢 🚀
┃ ✦ 𝙈𝙖𝙙𝙚 𝙛𝙤𝙧 𝙎𝙥𝙚𝙚𝙙 & 𝙋𝙤𝙬𝙚𝙧
┗━━━━━━━━━━━━━━━┛

┏━━〔 ⚙️ 𝘾𝙊𝙈𝙈𝘼𝙉𝘿𝙎 〕━━┓
┃ ⬡ /pair
┃ ⬡ /delpair
┃ ⬡ /help
┃ ⬡ /menu
┗━━━━━━━━━━━━━━━┛

╔════〔 👑 𝗕𝗜𝗟𝗔𝗟 𝗠𝗗 〕════╗
┃ 💻 𝘿𝙚𝙫 : 𝗕𝗜𝗟𝗔𝗟 𝗞𝗜𝗡𝗚 
┃ 🌐 𝙎𝙮𝙨𝙩𝙚𝙢 : 𝙈𝘿 𝘽𝙤𝙩
╚══════════════════╝︎`

bot.sendMessage(chatId, welcomeMessage, {
  parse_mode: 'Markdown',
  reply_markup: {
    inline_keyboard: [
      [
        { 
          text: '🚫 Join Group', 
          url: 'https://t.me/bilal_982' 
        }
      ],
      [
        { 
          text: '🚫 Channel 1', 
          url: 'https://t.me/ajjeidnxoeodjnd' 
        }   
      [
        { 
          text: '💬 WhatsApp', 
          url: 'https://whatsapp.com/channel/0029Vaj3Xnu17EmtDxTNnQ0G' 
        }
      ]
    ]
  }
});
    
});

// Help command
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    
const helpMessage = `╭━━━〔 🤖 𝗕𝗜𝗟𝗔𝗟 𝗠𝗗 𝘾𝙊𝙈𝙈𝘼𝙉𝘿𝙎 〕━━━╮

┏━〔 🔗 𝙋𝘼𝙄𝙍𝙄𝙉𝙂 𝙎𝙔𝙎𝙏𝙀𝙈 〕━┓
┃ ⬡ /pair <number>
┃ ➤ ᴄᴏɴɴᴇᴄᴛ ʏᴏᴜʀ ᴡʜᴀᴛsᴀᴘᴘ ᴅᴇᴠɪᴄᴇ 🔗
┃
┃ ⬡ /delpair <number>
┃ ➤ ʀᴇᴍᴏᴠᴇ ᴘᴀɪʀᴇᴅ ᴅᴇᴠɪᴄᴇ ❌
┗━━━━━━━━━━━━━━━┛

┏━〔 ⚡ 𝙎𝙔𝙎𝙏𝙀𝙈 𝙄𝙉𝙁𝙊 〕━┓
┃ ⬡ /runtime
┃ ➤ ᴄʜᴇᴄᴋ ʙᴏᴛ ᴜᴘᴛɪᴍᴇ & sᴘᴇᴇᴅ ⚡
┗━━━━━━━━━━━━━━━┛

┏━〔 📖 𝙃𝙀𝙇𝙋 𝘾𝙀𝙉𝙏𝙀𝙍 〕━┓
┃ ⬡ /help
┃ ➤ sʜᴏᴡ ғᴜʟʟ ʙᴏᴛ ᴄᴏᴍᴍᴀɴᴅs 📚
┗━━━━━━━━━━━━━━━┛

╰━━━〔 👑 𝙋𝙊𝙒𝙀𝙍𝙀𝘿 𝘽𝙔 𝗕𝗜𝗟𝗔𝗟 𝐊𝐈𝐍𝐆 〕━━━╯`
;

  bot.sendMessage(chatId, helpMessage, {
  parse_mode: 'Markdown',
  reply_markup: {
    inline_keyboard: [
      [
        { text: '💬 WhatsApp', url: 'https://whatsapp.com/channel/0029Vaj3Xnu17EmtDxTNnQ0G' }
      ],
      [
        { 
          text: '🚫 Channel 1', 
          url: 'https://t.me/ajjeidnxoeodjnd' 
        },
        { 
          text: '🚫 group 2', 
          url: 'https://t.me/bilal_982' 
        }
      ]
    ]
  }
});
    
});

// ====== REPORT FUNCTION ======
function handleReport(bot, ADMIN_IDS) {
    bot.onText(/\/report (.+)/, async (msg, match) => {
        const userId = msg.from.id;
        const chatId = msg.chat.id;
        const reportText = match[1];

        // ✅ Confirm to user
        await bot.sendMessage(chatId, "✅ Your report has been submitted successfully. Our admins will review it soon.");

        // 📢 Build report message
        const reportMessage = `
📢 *New Report Received*

👤 User: [${msg.from.first_name || "Unknown"}](tg://user?id=${userId})
🆔 ID: \`${userId}\`

📝 *Report Content:*
${reportText}
`;

        // 🚀 Send to all admins
        ADMIN_IDS.forEach(async (adminId) => {
            try {
                await bot.sendMessage(adminId, reportMessage, { parse_mode: "Markdown" });

                if (msg.photo || msg.document || msg.video) {
                    await bot.forwardMessage(adminId, chatId, msg.message_id);
                }
            } catch (err) {
                console.error(`❌ Failed to send report to admin ${adminId}`, err);
            }
        });
    });
}

// Pair command
bot.onText(/\/pair(?:\s+(.+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    
    const phoneInput = match[1];
    
    if (!phoneInput) {
                bot.sendMessage(chatId, '❌ *Missing Phone Number!*\n\n' +
'━━━━━━━━━━━━━━━\n' +
'📌 *Command:* `/pair <phone_number>`\n' +
'📱 *Example:* `/pair 923078071982`\n' +
'🔑 *With Code:* `/pair 923078071982|1234`\n' +
'━━━━━━━━━━━━━━━', { parse_mode: 'Markdown' });
        return;
    }
    
    // Validate phone number with enhanced validation
    const validation = validatePhoneNumber(phoneInput.trim());
    if (!validation.valid) {
        bot.sendMessage(chatId, validation.error, { parse_mode: 'Markdown' });
        return;
    }
    
    // Extract phone number and optional code
    const parts = phoneInput.split('|');
    const cleanNumber = parts[0];
    const customCode = parts[1] || null;
    
    // Check if session already exists
    const sessionPath = `./IGRIS-XD/pairing/${cleanNumber}`;
    if (fs.existsSync(sessionPath)) {
        bot.sendMessage(chatId, `⚠️ Session already exists for number: \`${cleanNumber}\`\n\nUse \`/delpair ${cleanNumber}\` to delete it first if you want to create a new one.`, { parse_mode: 'Markdown' });
        return;
    }
    
    // Check if already pairing this number
    if (activeSessions.has(cleanNumber)) {
        bot.sendMessage(chatId, `⏳ Pairing already in progress for: \`${cleanNumber}\``, { parse_mode: 'Markdown' });
        return;
          bot.sendMessage(chatId, helpMessage, {
  parse_mode: 'Markdown',
  reply_markup: {
    inline_keyboard: [
      [
        { text: '💬 WhatsApp', url: 'https://whatsapp.com/channel/0029Vaj3Xnu17EmtDxTNnQ0G' }
      ],
      [
        { 
          text: '🥰 Channel 1', 
          url: 'https://t.me/ajjeidnxoeodjnd' 
        },
        { 
          text: '🌹 Channel 2', 
          url: 'https://t.me/bilal_982' 
        }
      ]
    ]
  }
});
    }
    
    try {
        const statusMessage = customCode 
            ? `🔄 Starting pairing process for: \`${cleanNumber}\` with custom code: \`${customCode}\`\n\nPlease wait...`
            : `🩸 Starting pairing process for: \`${cleanNumber}\`\n\nPlease wait...`;
            
        bot.sendMessage(chatId, statusMessage, { parse_mode: 'Markdown' });
        
        // Mark as active
        activeSessions.set(cleanNumber, { 
            chatId, 
            startTime: Date.now(),
            customCode: customCode 
        });
        
        // Start the pairing process
        await startpairing(cleanNumber);
        
        // Wait a bit for the pairing code to be generated
        setTimeout(async () => {
            try {
                const pairingFilePath = './IGRIS-XD/pairing/pairing.json';
                if (fs.existsSync(pairingFilePath)) {
                    const pairingData = JSON.parse(fs.readFileSync(pairingFilePath, 'utf8'));
                    if (pairingData.code) {
                        const displayCode = customCode || pairingData.code;
                        const codeMessage = customCode 
                            ? `\`\`\`Sucess ✅ Custom Pairing Code Set!\n\n📱 Number: \`${cleanNumber}\`\n🔑 Code: \`${displayCode}\`\n\nInstructions:\n1. Open WhatsApp on your phone\n2. Go to Settings > Linked Devices\n3. Tap "Link a Device"\n4. Enter the custom code above\n\n⏰ Code expires in 5 minutes\`\`\``
                            : `\`\`\`Sucess ✅ Pairing Code Generated!\n\n📱 Number: \`${cleanNumber}\`\n🔑 Code: \`${displayCode}\`\n\nInstructions:\n1. Open WhatsApp on your phone\n2. Go to Settings > Linked Devices\n3. Tap "Link a Device"\n4. Enter the code above\n\n⏰ Code expires in 5 minutes\`\`\``;
                            
                        bot.sendMessage(chatId, codeMessage, { parse_mode: 'Markdown' });
                        
                        // Clean up the pairing file
                        setTimeout(() => {
                            if (fs.existsSync(pairingFilePath)) {
                                fs.unlinkSync(pairingFilePath);
                            }
                        }, 5000);
                    }
                } else {
                    // If no pairing file but custom code provided
                    if (customCode) {
                        bot.sendMessage(chatId, `\`\`\`Success ✅ Custom Pairing Code Set!\n\n📱 Number: \`${cleanNumber}\`\n🔑 Code: \`${customCode}\`\n\nInstructions:\n1. Open WhatsApp on your phone\n2. Go to Settings > Linked Devices\n3. Tap "Link a Device"\n4. Enter the custom code above\n\n⏰ Code expires in 5 minutes\`\`\``, { parse_mode: 'Markdown' });
                    }
                }
                
                // Remove from active sessions after 10 minutes
                setTimeout(() => {
                    activeSessions.delete(cleanNumber);
                }, 600000);
                
            } catch (error) {
                console.error('Error reading pairing code:', error);
                bot.sendMessage(chatId, `❌ Error retrieving pairing code for: \`${cleanNumber}\`\n\nError: ${error.message}`, { parse_mode: 'Markdown' });
                activeSessions.delete(cleanNumber);
            }
        }, 3000);
        
    } catch (error) {
        console.error('Pairing error:', error);
        bot.sendMessage(chatId, `❌ Error starting pairing for: \`${cleanNumber}\`\n\nError: ${error.message}`, { parse_mode: 'Markdown' });
        activeSessions.delete(cleanNumber);
    }
});

// ====== BROADCAST FUNCTION ======
function handleBroadcast(bot, ADMIN_IDS, loadUsers) {
    bot.onText(/\/broadcast (.+)/, async (msg, match) => {
        const senderId = msg.from.id;

        if (!ADMIN_IDS.includes(senderId)) {
            return bot.sendMessage(msg.chat.id, "❌ You are not authorized to use this command.");
        }

        const broadcastText = match[1];
        let users = loadUsers();
        let count = 0;

        for (let userId in users) {
            try {
                await bot.sendMessage(
                    userId,
                    `📢 *Broadcast Message:*\n\n${broadcastText}`,
                    { parse_mode: "Markdown" }
                );
                count++;
            } catch (err) {
                console.error(`❌ Failed to send broadcast to ${userId}`, err);
            }
        }

        bot.sendMessage(senderId, `✅ Broadcast sent to ${count} users.`);
    });
}

// Delete pair command
bot.onText(/\/delpair(?:\s+(.+))?/, (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    
    
    const phoneInput = match[1];
    
    if (!phoneInput) {
        bot.sendMessage(chatId, '❌ *Missing Phone Number!*\n\n' +
'━━━━━━━━━━━━━━━\n' +
'📌 *Command:* `/delpair <phone_number>`\n' +
'📱 *Example:* `/delpair 923078071982`\n' +
'━━━━━━━━━━━━━━━', { parse_mode: 'Markdown' });
        return;
          bot.sendMessage(chatId, helpMessage, {
  parse_mode: 'Markdown',
  reply_markup: {
    inline_keyboard: [
      [
        { text: '💯 WhatsApp', url: 'https://whatsapp.com/channel/0029Vaj3Xnu17EmtDxTNnQ0G' }
      ],
      [
        { 
          text: '✅ Channel 1', 
          url: 'https://t.me/ajjeidnxoeodjnd' 
        },
        { 
          text: '✅ Channel 2', 
          url: 'https://t.me/bilal_982' 
        }
      ]
    ]
  }
});
    }
    
    // Use same validation for consistency
    const validation = validatePhoneNumber(phoneInput.trim().split('|')[0]); // Only validate the number part
    if (!validation.valid) {
        bot.sendMessage(chatId, validation.error, { parse_mode: 'Markdown' });
        return;
    }
    
    const cleanNumber = phoneInput.trim().split('|')[0]; // Extract just the number part
    
    try {
        if (deleteSessionFolder(cleanNumber)) {
            bot.sendMessage(chatId, `✅ Session deleted successfully for: \`${cleanNumber}\``, { parse_mode: 'Markdown' });
            
            // Remove from active sessions if exists
            activeSessions.delete(cleanNumber);
            
            console.log(chalk.green(`Session deleted for ${cleanNumber} via Telegram bot`));
        } else {
            bot.sendMessage(chatId, `❌ Session not found for: \`${cleanNumber}\``, { parse_mode: 'Markdown' });
        }
    } catch (error) {
        console.error('Delete error:', error);
        bot.sendMessage(chatId, `❌ Error deleting session for: \`${cleanNumber}\`\n\nError: ${error.message}`, { parse_mode: 'Markdown' });
    }
});

// List pairs command
bot.onText(/\/listpair/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    
    if (!isAdmin(userId)) {
        bot.sendMessage(chatId, '❌ Access denied.');
        return;
    }
    
    try {
        const sessions = getSessionFolders();
        
        if (sessions.length === 0) {
            bot.sendMessage(chatId, '📋 *Active Sessions*\n\n❌ No active sessions found.', { parse_mode: 'Markdown' });
            return;
        }
        
        let message = '📋 *Active Sessions*\n\n';
        sessions.forEach((session, index) => {
            const sessionPath = `./IGRIS-XD/pairing/${session}`;
            const stats = fs.statSync(sessionPath);
            const createdDate = new Date(stats.birthtime).toLocaleString();
            
            message += `${index + 1}. 📱 \`${session}\`\n`;
            message += `   📅 Created: ${createdDate}\n\n`;
        });
        
        message += `\n📊 Total: ${sessions.length} session(s)`;
        
        bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
        
    } catch (error) {
        console.error('List sessions error:', error);
        bot.sendMessage(chatId, `❌ Error retrieving sessions list.\n\nError: ${error.message}`, { parse_mode: 'Markdown' });
    }
});

// Handle unknown commands
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const text = msg.text;
    
    if (!isAdmin(userId)) {
        return;
    }
    
    // Skip if it's a known command
    if (text && text.startsWith('/') && 
        (text.startsWith('/start') || text.startsWith('/help') || 
         text.startsWith('/pair') || text.startsWith('/delpair') || 
         text.startsWith('/listpair'))) {
        return;
    }
    
    if (text && text.startsWith('/')) {
        bot.sendMessage(chatId, '❌ Unknown command. Use /help to see available commands.');
    }
});

// Error handling
bot.on('polling_error', (error) => {
    console.error('Telegram bot polling error:', error);
});

bot.on('error', (error) => {
    console.error('Telegram bot error:', error);
});

// Startup message
console.log(chalk.blue('🤖 Telegram WhatsApp Pairing Bot started successfully!'));
console.log(chalk.yellow('Make sure to:'));
console.log(chalk.yellow('1. Replace BOT_TOKEN with your actual bot token'));
console.log(chalk.yellow('2. Add your Telegram user IDs to ADMIN_IDS array'));
console.log(chalk.yellow('3. Ensure your pair.js file is in the same directory'));

module.exports = bot;
