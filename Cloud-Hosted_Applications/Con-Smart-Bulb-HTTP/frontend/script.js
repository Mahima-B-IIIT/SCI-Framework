// frontend/script.js

// Because the UI is on port 8080 and the Server is on port 3000, 
// we must specify the full address of the API.
const API_BASE = "http://localhost:3000";

const log = (msg) => {
  const el = document.getElementById("log");
  if (el) {
    el.textContent = `[${new Date().toLocaleTimeString()}] ${msg}\n` + el.textContent;
  }
};

async function fetchJSON(url) {
  // Prepends the API_BASE to every request
  const res = await fetch(`${API_BASE}${url}`);
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
}

async function refreshShadow() {
  try {
    const data = await fetchJSON("/shadow");

    document.getElementById("lights").textContent =
      data.shadow.reported.lights ? "ON" : "OFF";

    document.getElementById("offTs").textContent =
      data.shadow.reported.lightOffTimestamp;

    document.getElementById("delta").textContent =
      data.delta ? JSON.stringify(data.delta.state) : "None";

    log("Shadow refreshed");
  } catch (err) {
    log(`Refresh error: ${err.message}`);
  }
}

async function refreshDuration() {
  try {
    const data = await fetchJSON("/duration");

    document.getElementById("secs").textContent = data.secondsSinceLastOff;
    document.getElementById("alert").textContent =
      data.lastDurationAlert ? JSON.stringify(data.lastDurationAlert) : "None";

    log("Duration refreshed");
  } catch (err) {
    log(`Duration error: ${err.message}`);
  }
}

async function setDesired(lights) {
  try {
    await fetch(`${API_BASE}/manual/desired`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lights })
    });

    log(`Manual desired set: ${lights}`);
    refreshShadow();
  } catch (err) {
    log(`Manual set error: ${err.message}`);
  }
}

// ===== SEND MANUAL BRIGHTNESS =====
async function sendBrightness(value) {
  try {
    const res = await fetch(`${API_BASE}/sensor`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uv_visible: value })
    });

    const data = await res.json();
    log(`Brightness sent: ${value} → desired.lights = ${data.decidedDesired.lights}`);
    refreshShadow();
  } catch (err) {
    log(`Sensor error: ${err.message}`);
  }
}

// ===== RUN ALERT TEST =====
async function runAlertTest() {
  try {
    await fetch(`${API_BASE}/test/alert`, { method: "POST" });
    log("Started 30-second alert test");
  } catch (err) {
    log(`Test error: ${err.message}`);
  }
}

// ===== EVENT HANDLERS =====
document.getElementById("refresh").onclick = refreshShadow;
document.getElementById("refreshDuration").onclick = refreshDuration;

document.getElementById("onBtn").onclick = () => setDesired(true);
document.getElementById("offBtn").onclick = () => setDesired(false);

document.getElementById("sendBrightnessBtn").onclick = async () => {
  const value = Number(document.getElementById("brightnessInput").value);
  if (isNaN(value) || value < 0 || value > 1000) {
    alert("Please enter a valid brightness between 0 and 1000");
    return;
  }
  await sendBrightness(value);
};

document.getElementById("runAlertTestBtn").onclick = runAlertTest;

// ===== INITIAL LOAD =====
refreshShadow();
refreshDuration();