const axios = require('axios');

// duplicate message prevent
const processedMessages = new Set();

async function tiktokCommand(sock, chatId, message) {
    try {

        // duplicate block
        if (processedMessages.has(message.key.id)) return;
        processedMessages.add(message.key.id);

        setTimeout(() => {
            processedMessages.delete(message.key.id);
        }, 5 * 60 * 1000);

        const text =
            message.message?.conversation ||
            message.message?.extendedTextMessage?.text ||
            "";

        const url = text.split(' ').slice(1).join(' ').trim();

        if (!url) {
            return await sock.sendMessage(chatId, {
                text: "📌 Please give a TikTok link\n\nExample:\n.tt https://tiktok.com/..."
            });
        }

        if (!url.includes("tiktok.com")) {
            return await sock.sendMessage(chatId, {
                text: "❌ Invalid TikTok link!"
            });
        }

        await sock.sendMessage(chatId, {
            react: { text: "⏳", key: message.key }
        });

        // =========================
        // API CALL
        // =========================
        const api = `https://whiteshadow-api.vercel.app/download/tiktok?url=${encodeURIComponent(url)}`;
        const { data } = await axios.get(api);

        if (!data || !data.status || !data.result || !data.result.data) {
            return await sock.sendMessage(chatId, {
                text: "❌ Failed to fetch TikTok data!"
            });
        }

        const result = data.result.data;

        const videoUrl = result.play;
        const title = result.title || "TikTok Video";
        const duration = result.duration;
        const cover = result.cover;

        if (!videoUrl) {
            return await sock.sendMessage(chatId, {
                text: "❌ Video not found!"
            });
        }

        // =========================
        // SEND PREVIEW
        // =========================
        await sock.sendMessage(chatId, {
            image: { url: cover },
            caption: `🎬 *TIKTOK DOWNLOADER*

📌 Title: ${title}
⏱ Duration: ${duration}s

⬇️ Downloading...`
        }, { quoted: message });

        // =========================
        // SEND VIDEO
        // =========================
        await sock.sendMessage(chatId, {
            video: { url: videoUrl },
            mimetype: "video/mp4",
            caption: `✨ *BILAL MD*`
        }, { quoted: message });

        await sock.sendMessage(chatId, {
            react: { text: "✅", key: message.key }
        });

    } catch (error) {
        console.error("TikTok Error:", error);

        await sock.sendMessage(chatId, {
            text: "❌ Error downloading TikTok video. Try again later."
        });
    }
}

module.exports = tiktokCommand;