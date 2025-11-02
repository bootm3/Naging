/**
 * @author VK. SAIM
 * @command calendar
 * @description Full Dhaka Calendar in image (EN + BN)
 */

const fs = require("fs");
const { createCanvas } = require("canvas");

module.exports.config = {
  name: "calendar",
  version: "3.0.0",
  hasPermssion: 0,
  credits: "VK. SAIM",
  description: "Full Dhaka Calendar in image with EN + BN dates",
  commandCategory: "Utility",
  usages: "calendar",
  cooldowns: 3,
};

// Bangla numbers helper
const bnNumbers = ["০","১","২","৩","৪","৫","৬","৭","৮","৯"];
function toBanglaNumber(num){
  return num.toString().split("").map(d=>bnNumbers[d]||d).join("");
}

// Bangla weekdays
const bnWeekdays = ["রবি","সোম","মঙ্গল","বুধ","বৃহস্পতি","শুক্র","শনি"];

module.exports.run = async function ({ api, event }) {
  try {
    const width = 900;
    const height = 700;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // Dhaka date
    const now = new Date();
    const dhakaTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Dhaka" }));
    const year = dhakaTime.getFullYear();
    const month = dhakaTime.getMonth();
    const today = dhakaTime.getDate();

    // Month names
    const enMonths = [
      "January","February","March","April","May","June",
      "July","August","September","October","November","December"
    ];
    const bnMonths = ["জানুয়ারী","ফেব্রুয়ারী","মার্চ","এপ্রিল","মে","জুন","জুলাই","আগস্ট","সেপ্টেম্বর","অক্টোবর","নভেম্বর","ডিসেম্বর"];

    // Background gradient
    const gradient = ctx.createLinearGradient(0,0,width,height);
    gradient.addColorStop(0,"#3b82f6");
    gradient.addColorStop(1,"#9333ea");
    ctx.fillStyle = gradient;
    ctx.fillRect(0,0,width,height);

    // Title: Month & Year
    ctx.fillStyle = "white";
    ctx.font = "bold 50px Sans";
    ctx.textAlign = "center";
    ctx.fillText(`${enMonths[month]} / ${bnMonths[month]} ${year}`, width/2, 70);

    // Weekdays header
    ctx.font = "bold 30px Sans";
    const cellWidth = width/7;
    const cellHeight = 60;
    for(let i=0;i<7;i++){
      ctx.fillStyle = "white";
      ctx.fillText(`${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][i]} / ${bnWeekdays[i]}`, cellWidth*i + cellWidth/2, 130);
    }

    // Get first day of month
    const firstDay = new Date(year, month, 1).getDay();
    // Get total days in month
    const totalDays = new Date(year, month+1, 0).getDate();

    // Draw dates
    let x = firstDay;
    let y = 0;
    ctx.font = "bold 28px Sans";
    for(let day=1; day<=totalDays; day++){
      const posX = x*cellWidth + cellWidth/2;
      const posY = 180 + y*cellHeight;

      // Highlight today
      if(day===today){
        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.beginPath();
        ctx.arc(posX, posY-10, 25, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = "#ffec00";
      } else {
        ctx.fillStyle = "white";
      }

      ctx.fillText(`${day} / ${toBanglaNumber(day)}`, posX, posY);

      x++;
      if(x>6){
        x=0;
        y++;
      }
    }

    // Footer
    ctx.font = "20px Sans";
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.fillText("Powered by VK. SAIM", width/2, height-30);

    // Save image
    const buffer = canvas.toBuffer("image/png");
    const imgPath = __dirname + "/cache/calendar.png";
    fs.writeFileSync(imgPath, buffer);

    // Send image
    return api.sendMessage(
      { body: "🗓️ Your Dhaka Calendar", attachment: fs.createReadStream(imgPath) },
      event.threadID,
      () => fs.unlinkSync(imgPath),
      event.messageID
    );

  } catch(err){
    console.error(err);
    return api.sendMessage("⛔ Error creating calendar image.", event.threadID, event.messageID);
  }
};
