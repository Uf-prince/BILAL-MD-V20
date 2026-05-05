const axios = require('axios');

async function songCommand(sock, chatId, message) {
    try {
        const text =
            message.message?.conversation ||
            message.message?.extendedTextMessage?.text ||
            "";

        const query = text.split(' ').slice(1).join(' ').trim();

        if (!query) {
            return await sock.sendMessage(chatId, {
                text: "🎵 Please give me a song name or YouTube link\n\nExample:\n.song lelena"
            });
        }

        await sock.sendMessage(chatId, {
            react: { text: "🔎", key: message.key }
        });

        let videoUrl;
        let title = "Unknown";
        let thumbnail = "";
        let duration = "";

        const isUrl = query.startsWith("http");

        if (isUrl) {
            videoUrl = query;
        } else {
            // 🔥 SEARCH API CALL - FIXED: query use ki hai videoUrl ki jagah
            const searchApi = `http://176.100.37.91:30336/api/ytb?url=${encodeURIComponent(query)}`;
            const { data } = await axios.get(searchApi);

            // API response check ko behtar kiya gaya hai
            if (!data || !data.result || !data.result.url) {
                return await sock.sendMessage(chatId, {
                    text: "❌ No songs found!"
                });
            }

            videoUrl = data.result.url;
            title = data.result.title || "Unknown Title";
            thumbnail = data.result.thumbnail || "";
            duration = data.result.duration || "";
        }

        // ========================
        // 2. SAVE TUBE API
        // ========================
        const api = `https://savetube-api.vercel.app/download?url=${encodeURIComponent(videoUrl)}`;
        const { data: dlData } = await axios.get(api);

        if (!dlData || !dlData.status || !dlData.result) {
            return await sock.sendMessage(chatId, {
                text: "❌ Failed to fetch song data from API"
            });
        }

        const result = dlData.result;

        // fallback values
        title = result.title || title;
        thumbnail = result.thumbnail || thumbnail;
        duration = result.duration || duration;

        const audioUrl = result.download_url || result.url; // Support both keys

        if (!audioUrl) {
            return await sock.sendMessage(chatId, {
                text: "❌ Download link not found!"
            });
        }

        // ========================
        // 3. SEND THUMBNAIL
        // ========================
        await sock.sendMessage(chatId, {
            image: { url: thumbnail },
            caption: `🎵 *BILAL MUSIC*\n\n📌 Title: ${title}\n⏱ Duration: ${duration}\n\n⬇️ Downloading...`
        }, { quoted: message });

        // ========================
        // 4. SEND AUDIO
        // ========================
        await sock.sendMessage(chatId, {
            audio: { url: audioUrl },
            mimetype: "audio/mpeg",
            fileName: `${title}.mp3`,
            ptt: false
        }, { quoted: message });

        await sock.sendMessage(chatId, {
            react: { text: "✅", key: message.key }
        });

    } catch (err) {
        console.error("Song Error:", err);
        await sock.sendMessage(chatId, {
            text: "❌ Error downloading song. Try again later."
        });
    }
}

module.exports = songCommand;
