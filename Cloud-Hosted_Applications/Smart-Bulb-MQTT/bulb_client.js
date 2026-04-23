import mqtt from "mqtt";
const client = mqtt.connect("mqtt://test.mosquitto.org");

let state = {
  lights: false,
  lightOffTimestamp: new Date().toISOString()
};

client.on("connect", () => {
  client.subscribe("home/bulb/command");
  console.log("💡 Bulb online and listening...");
});

client.on("message", (topic, message) => {
  const command = message.toString();
  const target = command === "ON";

  if (state.lights !== target) {
    state.lights = target;
    state.lightOffTimestamp = target ? new Date().toISOString() : state.lightOffTimestamp;
    
    console.log(state.lights ? "💡 ON" : "🌑 OFF");

    // Report back to shadow
    client.publish("home/bulb/reported", JSON.stringify(state), { retain: true });
  }
});