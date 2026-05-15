/**
   * Created By BILAL KING.
   * Fixed for Heroku Deployment with RGB Pairing
*/
const fs = require('fs');
const chalk = require('chalk');
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;
const { startPairing } = require('./pair'); // Ensure your pair.js exports { startpairing }

// --- Web Server Setup ---
// Agar aapne index.html alag banayi hai toh wo dikhaye ga, warna direct RGB interface
app.get('/', (req, res) => {
    // Agar index.html file exist karti hai toh wo load kare, warna default styling
    const htmlPath = path.join(__dirname, 'pair.html');
    if (fs.existsSync(htmlPath)) {
        res.sendFile(htmlPath);
    } else {
        res.send(`
        <body style="background:#000; color:#fff; text-align:center; font-family:sans-serif; display:flex; flex-direction:column; justify-content:center; height:100vh; margin:0;">
          <h1 style="color:#00FFA3; text-shadow: 0 0 10px #00FFA3;">BILAL-MD IS ACTIVE 🟢</h1>
          <p style="font-size:20px;">Developer: <span style="color:#ff00c8;">BILAL KING</span></p>
          <div style="padding:20px; border:2px solid #00FFA3; border-radius:15px; margin:20px auto; width:80%; max-width:400px; box-shadow: 0 0 20px #00FFA3;">
            <p>Go to your Pairing Page to link your device.</p>
          </div>
        </body>`);
    }
});

// --- API Endpoint for Pairing Code ---
// Ye line sab se zaroori hai pairing code generate karne ke liye
app.get('/code', async (req, res) => {
    const number = req.query.number;
    if (!number) return res.status(400).json({ error: "Number is required" });

    try {
        console.log(chalk.cyan(`[!] Generating code for: ${number}`));
        const code = await startpairing(number);
        res.json({ code: code });
    } catch (err) {
        console.log(chalk.red(`[X] Pairing Error: ${err.message}`));
        res.status(500).json({ error: "Connection Failed. Try again." });
    }
});

app.listen(port, () => {
  console.log(chalk.green(`🌐 BILAL-MD Web Server active on port ${port}`));
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
  console.log(chalk.cyan('🚀 Initializing BILAL-MD System...'));
  await autoLoadPairs();
  launchBot();
};

function launchBot() {
  console.log(chalk.green('✅ Starting Core Services...'));
  // Ensure bot.js exists
  if (fs.existsSync('./bot.js')) {
      require('./bot'); 
  } else {
      console.log(chalk.red("❌ Error: bot.js not found!"));
  }
}

initializeBot().catch(console.error);
