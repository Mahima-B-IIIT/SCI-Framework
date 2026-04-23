import mqtt from "mqtt";

// Connect to the public broker
// Use the environment variable from Docker, or fallback to public broker
const BROKER_URL = process.env.MQTT_BROKER || "mqtt://test.mosquitto.org";
const client = mqtt.connect(BROKER_URL);

client.on("connect", () => {
  console.log("📡 Sensor online (Automated Random Mode)");
  console.log("Broadcasting to: home/sensor/brightness every 10s...");

  // Send a random value between 0 and 1000
  setInterval(() => {
    const randomVal = Math.floor(Math.random() * 1000);
    
    // MQTT payloads must be strings or buffers
    client.publish("home/sensor/brightness", randomVal.toString());
    
    console.log(`[Sensor] Published brightness: ${randomVal}`);
  }, 10000);
});

client.on("error", (err) => {
  console.error("Connection error:", err);
});