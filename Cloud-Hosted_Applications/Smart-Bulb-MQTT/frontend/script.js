// Connect via WebSockets (WSS) to the public broker
// Note: We use port 8081 for secure websockets on mosquitto.org
const client = mqtt.connect("wss://test.mosquitto.org:8081");

const log = (msg) => {
  const el = document.getElementById("log");
  const timestamp = new Date().toLocaleTimeString();
  el.textContent = `[${timestamp}] ${msg}\n` + el.textContent;
};

// 1. When we connect, subscribe to all relevant topics
client.on("connect", () => {
  log("Connected to MQTT Broker via WebSockets");
  
  client.subscribe("home/sensor/brightness");
  client.subscribe("home/bulb/reported");
  client.subscribe("home/bulb/command"); // To see manual overrides
});

// 2. Listen for incoming messages (No more fetching!)
client.on("message", (topic, message) => {
  const payload = message.toString();

  if (topic === "home/sensor/brightness") {
    document.getElementById("brightness_val").textContent = payload;
    log(`Sensor Update: ${payload}`);
  }

  if (topic === "home/bulb/reported") {
    const data = JSON.parse(payload);
    document.getElementById("lights").textContent = data.lights ? "ON" : "OFF";
    document.getElementById("offTs").textContent = data.lightOffTimestamp || "N/A";
    log(`Bulb State Reported: ${data.lights ? "ON" : "OFF"}`);
  }

  if (topic === "home/bulb/command") {
    document.getElementById("delta").textContent = `Command Sent: ${payload}`;
  }
});

// 3. User Actions (Publishing directly to the broker)
document.getElementById("onBtn").onclick = () => {
  client.publish("home/bulb/command", "ON");
  log("UI Action: Sent Manual ON");
};

document.getElementById("offBtn").onclick = () => {
  client.publish("home/bulb/command", "OFF");
  log("UI Action: Sent Manual OFF");
};

document.getElementById("sendBrightnessBtn").onclick = () => {
  const val = document.getElementById("brightnessInput").value;
  if (val !== "") {
    client.publish("home/sensor/brightness", val);
    log(`UI Action: Simulated Brightness ${val}`);
  }
};

// For the Alert Test, we can still use the server-side logic
document.getElementById("runAlertTestBtn").onclick = async () => {
  log("Triggering 40s Alert Test...");
  await fetch("/test/alert", { method: "POST" });
};