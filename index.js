/**
   * Created By BILAL KING.
   * Fixed for Heroku Deployment
*/
const fs = require('fs');
const chalk = require('chalk');
const express = require('express'); // Express for Web Server
const app = express();
const port = process.env.PORT || 3000;
const startpairing = require('./pair');

// --- Web Server Setup for Pairing Code ---
app.get('/', (req, res) => {
  const pairingFilePath = './IGRIS-XD/pairing/pairing.json';
  if (fs.existsSync(pairingFilePath)) {
    const data = JSON.parse(fs.readFileSync(pairingFilePath, 'utf8'));
    res.send(`
      <body style="background:#000; color:#00FFA3; text-align:center; font-family:sans-serif; padding:50px;">
        <h1 style="border-bottom:2px solid #00FFA3; display:inline-block;">🤖 BILAL-MD PAIRING</h1>
        <div style="margin-top:30px; border:2px dashed #00FFA3; padding:20px; border-radius:15px;">
          <h2>Phone: ${data.number}</h2>
          <h1 style="font-size:60px; letter-spacing:10px; color:#fff;">${data.code}</h1>
          <p style="font-size:18px;">Enter this code in WhatsApp > Linked Devices</p>
        </div>
      </body>
    `);
  } else {
    res.send(`
      <body style="background:#000; color:#fff; text-align:center; font-family:sans-serif; padding:50px;">
        <h1 style="color:#00FFA3;">BILAL-MD IS ACTIVE 🟢</h1>
        <p>Use Telegram Bot to generate a pairing code.</p>
        <p style="color:#888;">Developer: BILAL KING</p>
      </body>
    `);
  }
});

app.listen(port, () => {
  console.log(chalk.green(`🌐 Web Server active on port ${port}`));
});

// --- Bot Logic ---
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const autoLoadPairs = async () => {
  console.log(chalk.yellow('🔄 Auto-loading paired users...'));
  const pairingDir = './IGRIS-XD/pairing/';
  if (!fs.existsSync(pairingDir)) return;

  const pairUsers = fs.readdirSync(pairingDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .filter(name => /^\d/.test(name) || name.includes('@s.whatsapp.net'))
    .map(name => name.endsWith('@s.whatsapp.net') ? name : name + '@s.whatsapp.net');

  for (let i = 0; i < pairUsers.length; i++) {
    try {
      await startpairing(pairUsers[i]);
      await delay(5000);
    } catch (e) {
      console.log(chalk.red(`❌ Connection failed for ${pairUsers[i]}`));
    }
  }
};

const initializeBot = async () => {
  console.log(chalk.cyan('🚀 Initializing BILAL-MD without password...'));
  await autoLoadPairs();
  launchBot();
};

function launchBot() {
  console.log(chalk.green('✅ Starting Telegram and WhatsApp Bot...'));
  require('./bot'); // This starts your bot.js
}

initializeBot().catch(console.error);
