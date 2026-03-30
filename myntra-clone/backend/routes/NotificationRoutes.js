const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Register push token
router.post("/register", async (req, res) => {
  const { userId, token, platform } = req.body;
  try {
    await User.findByIdAndUpdate(userId, {
      pushToken: token,
      platform: platform,
    });
    res.json({ message: "Token registered successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Send notification to user (can be called from anywhere)
router.post("/send", async (req, res) => {
  const { userId, title, body, data } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user?.pushToken) {
      return res.status(404).json({ message: "No push token found" });
    }

    // Send via Expo Push API
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Accept-Encoding": "gzip, deflate",
      },
      body: JSON.stringify({
        to: user.pushToken,
        title,
        body,
        data: data || {},
        sound: "default",
        priority: "high",
      }),
    });

    const result = await response.json();
    res.json({ message: "Notification sent", result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Send notification to all users
router.post("/broadcast", async (req, res) => {
  const { title, body, data } = req.body;
  try {
    const users = await User.find({ pushToken: { $exists: true, $ne: null } });
    const tokens = users.map(u => u.pushToken);

    const messages = tokens.map(token => ({
      to: token,
      title,
      body,
      data: data || {},
      sound: "default",
    }));

    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(messages),
    });

    res.json({ message: `Notification sent to ${tokens.length} users` });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;