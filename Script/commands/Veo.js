// veo.js
// Mirai Bot Command: /veo
// Author: VK. SAIM

const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "veo",
  version: "1.1.0",
  hasPermssion: 0,
  credits: "VK. SAIM",
  description: "Generate video from text using CYBER ULLASH API with status messages",
  commandCategory: "Utilities",
  usages: "/veo <text>",
  cooldowns: 5,
};

module.exports.run = async ({ api, event, args }) => {
  const textPrompt = args.join(" ");
  if (!textPrompt) return api.sendMessage("❎ টেক্সট দিন ভিডিও তৈরি করার জন্য।", event.threadID);

  const API_URL = "https://mahbub-ullash.cyberbot.top/api/gh";

  // Step 1: Notify user video is being generated
  api.sendMessage("🎬 ভিডিও তৈরি হচ্ছে...", event.threadID);

  try {
    // Step 2: Generate video link from API
    const response = await axios.post(API_URL, { prompt: textPrompt });

    if (!response.data.status || !response.data.video) {
      return api.sendMessage("❎ ভিডিও তৈরি ব্যর্থ! আবার চেষ্টা করুন।", event.threadID);
    }

    const videoUrl = response.data.video;
    const filePath = path.join(__dirname, `veo_${Date.now()}.mp4`);

    // Step 3: Download the video
    const videoResponse = await axios.get(videoUrl, { responseType: "stream" });
    const writer = fs.createWriteStream(filePath);
    videoResponse.data.pipe(writer);

    writer.on("finish", () => {
      // Step 4: Send video file to chat with success message
      api.sendMessage(
        { body: "✅ ভিডিও তৈরি সফল! দেখুন নিচে ⬇️", attachment: fs.createReadStream(filePath) },
        event.threadID,
        () => {
          // Step 5: Delete the local file after sending
          fs.unlinkSync(filePath);
        }
      );
    });

    writer.on("error", (err) => {
      console.error("Error writing video file:", err);
      api.sendMessage("❎ ভিডিও সংরক্ষণে সমস্যা হয়েছে। আবার চেষ্টা করুন।", event.threadID);
    });

  } catch (error) {
    console.error("Error generating video:", error);
    api.sendMessage("❎ ভিডিও তৈরি করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।", event.threadID);
  }
};
