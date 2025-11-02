/**
 * @author VK. SAIM
 * @command calendar
 * @description Shows current Dhaka date with day of the week
 */

module.exports.config = {
  name: "calendar",
  version: "1.0.0",
  hasPermssion: 0, // যদি সব ইউজার ব্যবহার করতে পারে
  credits: "VK. SAIM",
  description: "Show current Dhaka date and day",
  commandCategory: "Utility",
  usages: "calendar",
  cooldowns: 3,
};

module.exports.run = async function ({ api, event }) {
  try {
    // Dhaka date with weekday
    const now = new Date();
    const options = {
      timeZone: "Asia/Dhaka",
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const dateString = now.toLocaleDateString("en-US", options);

    return api.sendMessage(`📅 Dhaka Calendar:\n${dateString}`, event.threadID, event.messageID);
  } catch (err) {
    console.error(err);
    return api.sendMessage("⛔ Error fetching calendar.", event.threadID, event.messageID);
  }
};
