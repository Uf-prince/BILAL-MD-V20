const axios = require('axios');

// duplicate prevent
const processedMessages = new Set();

async function instagramCommand(sock, chatId, message) {
    try {

        // duplicate check
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
                text: "📸 Please give an Instagram link\n\nExample:\n.ig https://instagram.com/..."
            });
        }

        if (!url.includes("instagram.com")) {
            return await sock.sendMessage(chatId, {
                text: "❌ Invalid Instagram link!"
            });
        }

        await sock.sendMessage(chatId, {
            react: { text: "⏳", key: message.key }
        });

        // =========================
        // API CALL
        // =========================
        const api = `https://igwhite.chamodshadow125.workers.dev/?url=${encodeURIComponent(url)}`;
        const { data } = await axios.get(api);

        if (!data || !data.status || !data.result) {
            return await sock.sendMessage(chatId, {
                text: "❌ Failed to fetch Instagram data!"
            });
        }

        const result = data.result;

        const videoUrl = result.download;
        const caption = result.caption || "Instagram Video";
        const username = result.username || "unknown";

        if (!videoUrl) {
            return await sock.sendMessage(chatId, {
                text: "❌ Media not found!"
            });
        }

        // =========================
        // PREVIEW MESSAGE
        // =========================
        await sock.sendMessage(chatId, {
            text: `📸 *INSTAGRAM DOWNLOADER*

👤 User: ${username}
📝 Caption: ${caption.substring(0, 100)}...

⬇️ Downloading...`
        }, { quoted: message });

        // =========================
        // SEND VIDEO
        // =========================
        await sock.sendMessage(chatId, {
            video: { url: videoUrl },
            mimetype: "video/mp4",
            caption: `✨ *Bilal MD*`
        }, { quoted: message });

        await sock.sendMessage(chatId, {
            react: { text: "✅", key: message.key }
        });

    } catch (error) {
        console.error("IG Error:", error);

        await sock.sendMessage(chatId, {
            text: "❌ Error downloading Instagram media."
        });
    }
}

module.exports = instagramCommand;