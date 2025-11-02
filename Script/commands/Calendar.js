/**
 * @author VK. SAIM
 * @command calendar
 * @description Full real calendar style Dhaka Calendar image
 */

const fs = require("fs");
const { createCanvas } = require("canvas");

module.exports.config = {
  name: "calendar",
  version: "4.0.0",
  hasPermssion: 0,
  credits: "VK. SAIM",
  description: "Real calendar style Dhaka Calendar in image",
  commandCategory: "Utility",
  usages: "calendar",
  cooldowns: 3,
};

// Bangla numbers
const bnNumbers = ["০","১","২","৩","৪","৫","৬","৭","৮","৯"];
function toBanglaNumber(num){
  return num.toString().split("").map(d => bnNumbers[d] || d).join("");
}

// Bangla weekdays
const bnWeekdays = ["রবি","সোম","মঙ্গল","বুধ","বৃহঃ","শুক্র","শনি"];

module.exports.run = async function({ api, event }) {
  try {
    const width = 800;
    const height = 600;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // Dhaka time
    const now = new Date();
    const dhakaTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Dhaka" }));
    const year = dhakaTime.getFullYear();
    const month = dhakaTime.getMonth();
    const today = dhakaTime.getDate();

    // Month names
    const enMonths = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const bnMonths = ["জানুয়ারী","ফেব্রুয়ারী","মার্চ","এপ্রিল","মে","জুন","জুলাই","আগস্ট","সেপ্টেম্বর","অক্টোবর","নভেম্বর","ডিসেম্বর"];

    // Background
    ctx.fillStyle = "#fdf6e3";
    ctx.fillRect(0,0,width,height);

    // Title: Month Year
    ctx.fillStyle = "#2c3e50";
    ctx.font = "bold 45px Sans";
    ctx.textAlign = "center";
    ctx.fillText(`${enMonths[month]} / ${bnMonths[month]} ${year}`, width/2, 60);

    // Weekday headers
    const cellWidth = width/7;
    const cellHeight = 60;
    ctx.font = "bold 24px Sans";
    for(let i=0;i<7;i++){
      ctx.fillStyle = "#34495e";
      ctx.fillText(`${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][i]} / ${bnWeekdays[i]}`, cellWidth*i + cellWidth/2, 120);
    }

    // Get first day of month
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month+1, 0).getDate();

    // Draw calendar grid and dates
    ctx.font = "20px Sans";
    let x = firstDay;
    let y = 0;
    for(let day=1; day<=totalDays; day++){
      const posX = x*cellWidth + cellWidth/2;
      const posY = 160 + y*cellHeight;

      // Highlight today
      if(day === today){
        ctx.fillStyle = "#e74c3c";
        ctx.beginPath();
        ctx.arc(posX, posY-10, 22, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = "white";
      } else {
        ctx.fillStyle = "#2c3e50";
      }

      ctx.fillText(`${day} / ${toBanglaNumber(day)}`, posX, posY);

      x++;
      if(x>6){
        x=0;
        y++;
      }
    }

    // Grid lines (optional, for real calendar look)
    ctx.strokeStyle = "#bdc3c7";
    ctx.lineWidth = 1;
    for(let i=0;i<=7;i++){ // vertical
      ctx.beginPath();
      ctx.moveTo(i*cellWidth, 140);
      ctx.lineTo(i*cellWidth, 140 + cellHeight*6);
      ctx.stroke();
    }
    for(let i=0;i<=6;i++){ // horizontal
      ctx.beginPath();
      ctx.moveTo(0, 140 + i*cellHeight);
      ctx.lineTo(width, 140 + i*cellHeight);
      ctx.stroke();
    }

    // Footer
    ctx.font = "18px Sans";
    ctx.fillStyle = "#7f8c8d";
    ctx.fillText("Powered by VK. SAIM", width/2, height-20);

    // Save image
    const buffer = canvas.toBuffer("image/png");
    const imgPath = __dirname + "/cache/calendar.png";
    fs.writeFileSync(imgPath, buffer);

    // Send image
    return api.sendMessage(
      { body: "🗓️ Dhaka Real Calendar", attachment: fs.createReadStream(imgPath) },
      event.threadID,
      () => fs.unlinkSync(imgPath),
      event.messageID
    );

  } catch(err){
    console.error(err);
    return api.sendMessage("⛔ Error creating calendar image.", event.threadID, event.messageID);
  }
};
