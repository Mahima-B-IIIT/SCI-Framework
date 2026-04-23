import axios from "axios";
import readline from "readline";

const SERVER = process.env.SERVER || "http://localhost:3000";

let MANUAL_MODE = false;

// Ask user for brightness
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askBrightness() {
  rl.question("Enter brightness (0–1000) or 'r' for random: ", async (value) => {
    if (value.trim().toLowerCase() === "r") {
      MANUAL_MODE = false;
      console.log("Switched to RANDOM mode");
      return;
    }

    const num = Number(value);
    if (!isNaN(num)) {
      MANUAL_MODE = true;
      await sendBrightness(num);
    } else {
      console.log("Invalid input.");
    }

    askBrightness();
  });
}

// Send brightness to server
async function sendBrightness(uv_visible) {
  try {
    const { data } = await axios.post(`${SERVER}/sensor`, { uv_visible });
    console.log("[sensor] sent", uv_visible, "->", data.decidedDesired);
  } catch (e) {
    console.error("[sensor] error", e.message);
  }
}

// RANDOM MODE every 10s
setInterval(async () => {
  if (!MANUAL_MODE) {
    const randomVal = Math.random() * 1000;
    await sendBrightness(randomVal);
  }
}, 10_000);

console.log("[sensor] Running. Type a value to send manual brightness.");
askBrightness();
