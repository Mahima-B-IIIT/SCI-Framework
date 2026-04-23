import axios from "axios";

const SERVER = process.env.SERVER || "http://localhost:3000";

// Local bulb state (what the device is actually doing)
let lights = false; // start OFF

async function getDelta() {
  try {
    const { data } = await axios.get(`${SERVER}/commands/delta`);
    return data.delta; // { state: { lights: boolean } } | null
  } catch (e) {
    console.error("[bulb] delta error", e.message);
    return null;
  }
}

async function reportState() {
  try {
    const body = { lights };
    // If we just turned OFF, include OFF timestamp (server will set if omitted)
    if (lights === false) {
      body.lightOffTimestamp = new Date().toISOString();
    }
    const { data } = await axios.post(`${SERVER}/shadow/report`, body);
    console.log("[bulb] reported:", data.reported, "desired now:", data.desired);
  } catch (e) {
    console.error("[bulb] report error", e.message);
  }
}

async function loop() {
  // poll every 2s
  const delta = await getDelta();
  if (delta && delta.state && typeof delta.state.lights === "boolean") {
    const desired = delta.state.lights;
    if (desired !== lights) {
      // "Apply" the command
      lights = desired;
      console.log(lights ? "💡 Bulb ON" : "🌑 Bulb OFF");

      // Report new state back to server
      await reportState();
    }
  }
}

console.log("[bulb] polling for commands every 2s from", SERVER);
setInterval(loop, 2000);
