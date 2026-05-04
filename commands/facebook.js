const axios = require('axios');

async function facebookCommand(sock, chatId, message) {
    try {

        const text =
            message.message?.conversation ||
            message.message?.extendedTextMessage?.text ||
            "";

        const url = text.split(' ').slice(1).join(' ').trim();

        if (!url) {
            return await sock.sendMessage(chatId, {
                text: "🚩 Please provide a Facebook video URL.\n\nExample:\n.fb https://facebook.com/...."
            });
        }

        if (!url.includes('facebook.com')) {
            return await sock.sendMessage(chatId, {
                text: "❌ Invalid Facebook link!"
            });
        }

        // reaction
        await sock.sendMessage(chatId, {
            react: { text: "⏳", key: message.key }
        });

        // API CALL (FIXED)
        const { data } = await axios.get(
            `https://facebook-downloader.chamodshadow125.workers.dev/api/fb?url=${encodeURIComponent(url)}`
        );

        if (!data || !data.download || !data.download.videos) {
            return await sock.sendMessage(chatId, {
                text: "❌ API response error or video not found!"
            });
        }

        const videos = data.download.videos;

        if (!videos.length) {
            return await sock.sendMessage(chatId, {
                text: "❌ No downloadable video found!"
            });
        }

        // prefer HD else SD
        const hdVideo =
            videos.find(v => v.quality?.toLowerCase() === "hd") || videos[0];

        // send video directly (no file save needed)
        await sock.sendMessage(chatId, {
            video: { url: hdVideo.link },
            mimetype: "video/mp4",
            caption: `🎬 *FACEBOOK VIDEO DOWNLOADER*\n\n📝 ${data.metadata?.title || "Facebook Video"}\n⚡ Quality: ${hdVideo.quality || "Unknown"}\n\n🤖 BILAL-MD`
        }, { quoted: message });

        await sock.sendMessage(chatId, {
            react: { text: "✅", key: message.key }
        });

    } catch (error) {
        console.error("FB Command Error:", error);

        await sock.sendMessage(chatId, {
            text: "❌ Failed to fetch video. Try again later."
        });
    }
}

module.exports = facebookCommand;