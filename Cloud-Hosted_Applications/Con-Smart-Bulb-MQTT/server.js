import mqtt from "mqtt";
import express from "express";
import cors from "cors";

// 1. Initialize app first
const app = express();

// 2. Middleware (with parentheses!)
app.use(cors()); 
app.use(express.json()); // Good practice to have this for POST requests

// 3. MQTT Setup
const BROKER_URL = process.env.MQTT_BROKER || "mqtt://test.mosquitto.org";
const client = mqtt.connect(BROKER_URL);

const BRIGHTNESS_OFF_THRESHOLD = 700;
const ALERT_THRESHOLD_SEC = 30;

let shadow = {
  desired: null,
  reported: { lights: false, lightOffTimestamp: new Date().toISOString() }
};
let alertTestActive = false;

// ... (Rest of your MQTT logic is perfect)

client.on("connect", () => {
  console.log("🧠 Brain connected to MQTT Broker");
  client.subscribe(["home/sensor/brightness", "home/bulb/reported"]);
});

client.on("message", (topic, message) => {
  const payload = message.toString();

  if (topic === "home/sensor/brightness") {
    const uv_visible = parseInt(payload);
    if (!alertTestActive) {
      const shouldBeOn = uv_visible <= BRIGHTNESS_OFF_THRESHOLD;
      updateDesired(shouldBeOn);
    }
  }

  if (topic === "home/bulb/reported") {
    const data = JSON.parse(payload);
    shadow.reported = data;
    if (shadow.desired && shadow.desired.lights === data.lights) {
      shadow.desired = null;
    }
  }
});

function updateDesired(lights) {
  shadow.desired = { lights };
  client.publish("home/bulb/command", lights ? "ON" : "OFF", { retain: true });
}

setInterval(() => {
  if (shadow.reported.lights) {
    const onTime = Math.floor((Date.now() - new Date(shadow.reported.lightOffTimestamp).getTime()) / 1000);
    if (onTime >= ALERT_THRESHOLD_SEC) {
      console.log(`[ALERT] Light ON for ${onTime}s!`);
    }
  }
}, 1000);

app.get("/shadow", (req, res) => res.json({ shadow }));

app.post("/test/alert", (req, res) => {
  alertTestActive = true;
  updateDesired(true);
  setTimeout(() => { alertTestActive = false; }, 40000);
  res.json({ ok: true });
});

app.listen(3000, () => console.log("HTTP Stats Portal on port 3000"));