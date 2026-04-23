import mqtt from "mqtt";

// Connect to the public broker
const client = mqtt.connect("mqtt://test.mosquitto.org");

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