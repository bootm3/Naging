const fs = require('fs');
const path = require('path');

const coinsFile = path.join(__dirname, 'coins.json');

let coinsData = {};
if (fs.existsSync(coinsFile)) {
    try {
        coinsData = JSON.parse(fs.readFileSync(coinsFile, 'utf-8'));
    } catch { coinsData = {}; }
}

function saveCoins() {
    fs.writeFileSync(coinsFile, JSON.stringify(coinsData, null, 2));
}

function luckyNumber() {
    return Math.floor(Math.random() * 100) + 1;
}

function slotEmojis() {
    const emojis = ["🍒","🍋","🍉","🍇","⭐","💎","🎱"];
    return [emojis[Math.floor(Math.random()*emojis.length)],
            emojis[Math.floor(Math.random()*emojis.length)],
            emojis[Math.floor(Math.random()*emojis.length)]];
}

function formatCoins(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

module.exports.config = {
    name: "bet",
    version: "3.1.0",
    aliases: ["dau","gamble"],
    credits: "VK. SAIM",
    description: "Unique Bet Game with coins, emojis & profile picture",
    commandCategory: "fun",
    usages: "{pn}",
    hasPermssion: 0
};

module.exports.run = async ({ api, event }) => {
    // get user info
    let userName = "Player";
    let userAvatar = null;
    try {
        const info = await api.getUserInfo(event.senderID);
        const user = info[event.senderID];
        userName = user.name || "Player";
        userAvatar = user.profileUrl || user.avatar || null;
    } catch {}

    // initialize coins
    if (!coinsData[event.senderID]) {
        coinsData[event.senderID] = (event.senderID === "61566961113103") ? 100000000 : 100;
    }

    let coins = coinsData[event.senderID];
    let resultText = "";
    const gameChoice = Math.random() < 0.5 ? "coin" : "slot";

    if (gameChoice === "coin") {
        const outcome = Math.random() < 0.5 ? "🪙 Heads" : "🪙 Tails";
        const win = Math.random() < 0.5;
        const lucky = luckyNumber();

        if (win) {
            const gain = 20 + Math.floor(Math.random()*30); // 20-49 coins
            coins += gain;
            resultText = `🎲 Coin Flip Result: ${outcome}\n🎉 Lucky #${lucky} → You Win +${formatCoins(gain)} coins!`;
        } else {
            const loss = 10 + Math.floor(Math.random()*20); // 10-29 coins
            coins -= loss;
            resultText = `🎲 Coin Flip Result: ${outcome}\n😢 Lucky #${lucky} → You Lose -${formatCoins(loss)} coins!`;
        }

    } else { // Slot Machine
        const [s1,s2,s3] = slotEmojis();
        const lucky = luckyNumber();

        if (s1===s2 && s2===s3) {
            const gain = 500 + Math.floor(Math.random()*500); // 500-999
            coins += gain;
            resultText = `🎰 Slot Result: ${s1} | ${s2} | ${s3}\n🎉 JACKPOT! Lucky #${lucky} → +${formatCoins(gain)} coins!`;
        } else if (s1===s2 || s2===s3 || s1===s3) {
            const gain = 50 + Math.floor(Math.random()*50); // 50-99
            coins += gain;
            resultText = `🎰 Slot Result: ${s1} | ${s2} | ${s3}\n✨ Small Win! Lucky #${lucky} → +${formatCoins(gain)} coins!`;
        } else {
            const loss = 15 + Math.floor(Math.random()*20); // 15-34
            coins -= loss;
            resultText = `🎰 Slot Result: ${s1} | ${s2} | ${s3}\n😢 You Lose! Lucky #${lucky} → -${formatCoins(loss)} coins!`;
        }
    }

    coinsData[event.senderID] = coins;
    saveCoins();

    // Final text output
    let message = `👤 Player: ${userName}\n💰 Coins: ${formatCoins(coins)}\n\n${resultText}`;
    if (userAvatar) message += `\n🖼️ Profile: ${userAvatar}`;

    return api.sendMessage(message, event.threadID, event.messageID);
};
