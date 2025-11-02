// ==========================================
// Messenger Chatbot + Image-to-Video (Fixed)
// File: animate.js
// Author: VK. SAIM
// ==========================================

const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

const PAGE_ACCESS_TOKEN = "YOUR_FACEBOOK_PAGE_ACCESS_TOKEN"; // Facebook Page Token
const IMAGINE_API_KEY = "YOUR_IMAGINE_API_KEY";             // Imagine API Token
const VERIFY_TOKEN = "YOUR_VERIFY_TOKEN";                  // Webhook Verify Token

// -------------------- In-memory session storage --------------------
const userData = {};

// -------------------- Webhook verification --------------------
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("Webhook verified successfully!");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// -------------------- Messenger webhook --------------------
app.post("/webhook", async (req, res) => {
  const body = req.body;
  console.log("Webhook event received:", JSON.stringify(body, null, 2));

  if (body.object === "page") {
    for (const entry of body.entry) {
      const webhookEvent = entry.messaging[0];
      const senderId = webhookEvent.sender.id;

      try {
        // 1️⃣ Handle image upload
        if (webhookEvent.message && webhookEvent.message.attachments) {
          const attachment = webhookEvent.message.attachments[0];
          if (attachment.type === "image") {
            const uploaded_image_url = attachment.payload.url;

            // Save image in session
            userData[senderId] = { image: uploaded_image_url };

            // Ask for text prompt
            await sendText(senderId, "ছবি আপলোড হয়েছে! দয়া করে ভিডিওর জন্য টেক্সট লিখুন:");
          }
        }

        // 2️⃣ Handle text input
        else if (webhookEvent.message && webhookEvent.message.text) {
          const user_text = webhookEvent.message.text;

          if (userData[senderId] && userData[senderId].image) {
            const uploaded_image_url = userData[senderId].image;

            // Typing indicator
            await sendTyping(senderId, true);
            await sendText(senderId, "ভিডিও তৈরি হচ্ছে… অনুগ্রহ করে অপেক্ষা করুন।");

            // 3️⃣ Call Imagine API
            const video_url = await createVideo(uploaded_image_url, user_text);

            await sendTyping(senderId, false);

            // 4️⃣ Send video or error message
            if (video_url) {
              await sendVideo(senderId, video_url);
              await sendText(senderId, "ভিডিও তৈরি সফল! 🎉");
            } else {
              await sendText(senderId, "দুঃখিত, ভিডিও তৈরি করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
            }

            // Clear session
            delete userData[senderId];
          } else {
            await sendText(senderId, "দয়া করে আগে একটি ছবি আপলোড করুন।");
          }
        }
      } catch (err) {
        console.error("Error handling message:", err.message);
        await sendText(senderId, "দুঃখিত, কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।");
      }
    }

    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

// -------------------- Helper functions --------------------

// Send text message
async function sendText(senderId, text) {
  try {
    await axios.post(
      `https://graph.facebook.com/v15.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
      {
        recipient: { id: senderId },
        message: { text: text },
      }
    );
  } catch (err) {
    console.error("Error sending text:", err.response?.data || err.message);
  }
}

// Send video message
async function sendVideo(senderId, video_url) {
  try {
    await axios.post(
      `https://graph.facebook.com/v15.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
      {
        recipient: { id: senderId },
        message: {
          attachment: {
            type: "video",
            payload: { url: video_url, is_reusable: true },
          },
        },
      }
    );
  } catch (err) {
    console.error("Error sending video:", err.response?.data || err.message);
  }
}

// Send typing indicator
async function sendTyping(senderId, on = true) {
  try {
    await axios.post(
      `https://graph.facebook.com/v15.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
      {
        recipient: { id: senderId },
        sender_action: on ? "typing_on" : "typing_off",
      }
    );
  } catch (err) {
    console.error("Error sending typing:", err.response?.data || err.message);
  }
}

// Call Imagine API to create video
async function createVideo(image_url, prompt_text) {
  try {
    const response = await axios.post(
      "https://api.vyro.ai/v2/video/image-to-video",
      {
        image: image_url,
        prompt: prompt_text,
        resolution: "720p",
        duration: 5, // seconds
      },
      {
        headers: {
          Authorization: `Bearer ${IMAGINE_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Imagine API response:", response.data);
    return response.data.video_url;
  } catch (err) {
    console.error("Error creating video:", err.response?.data || err.message);
    return null;
  }
}

// -------------------- Start server --------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
