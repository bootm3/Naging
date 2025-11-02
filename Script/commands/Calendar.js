/**
 * @author VK. SAIM
 * @command calendar
 * @description Shows current Dhaka date with day of the week (in image format)
 */

const fs = require("fs");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");

module.exports.config = {
  name: "calendar",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "VK. SAIM",
  description: "Show current Dhaka date and day in image format",
  commandCategory: "Utility",
  usages: "calendar",
  cooldowns: 3,
};

module.exports.run = async function ({ api, event }) {
  try {
    // === Get Dhaka time ===
    const now = new Date();
    const options = {
      timeZone: "Asia/Dhaka",
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const dateString = now.toLocaleDateString("en-US", options);

    // === Create calendar image ===
    const width = 800;
    const height = 450;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#3b82f6"); // blue
    gradient.addColorStop(1, "#9333ea"); // purple
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Card background
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.fillRect(50, 100, 700, 250);
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 2;
    ctx.strokeRect(50, 100, 700, 250);

    // Title
    ctx.fillStyle = "white";
    ctx.font = "bold 40px Sans";
    ctx.fillText("📅 Dhaka Calendar", 230, 80);

    // Date text
    ctx.font = "bold 50px Sans";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(dateString, width / 2, 250);

    // Footer text
    ctx.font = "20px Sans";
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.fillText("Powered by VK. SAIM", width / 2, 400);

    // === Save image ===
    const buffer = canvas.toBuffer("image/png");
    const imgPath = __dirname + "/cache/calendar.png";
    fs.writeFileSync(imgPath, buffer);

    // === Send image ===
    return api.sendMessage(
      {
        body: "Here's your Dhaka Calendar 🗓️",
        attachment: fs.createReadStream(imgPath),
      },
      event.threadID,
      () => fs.unlinkSync(imgPath),
      event.messageID
    );
  } catch (err) {
    console.error(err);
    return api.sendMessage("⛔ Error creating calendar image.", event.threadID, event.messageID);
  }
};
