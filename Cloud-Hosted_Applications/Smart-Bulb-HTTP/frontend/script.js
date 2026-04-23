const log = (msg) => {
  const el = document.getElementById("log");
  el.textContent = `[${new Date().toLocaleTimeString()}] ${msg}\n` + el.textContent;
};

async function fetchJSON(url) {
  const res = await fetch(url);
  return res.json();
}

async function refreshShadow() {
  const data = await fetchJSON("/shadow");

  document.getElementById("lights").textContent =
    data.shadow.reported.lights ? "ON" : "OFF";

  document.getElementById("offTs").textContent =
    data.shadow.reported.lightOffTimestamp;

  document.getElementById("delta").textContent =
    data.delta ? JSON.stringify(data.delta.state) : "None";

  log("Shadow refreshed");
}

async function refreshDuration() {
  const data = await fetchJSON("/duration");

  document.getElementById("secs").textContent = data.secondsSinceLastOff;
  document.getElementById("alert").textContent =
    data.lastDurationAlert ? JSON.stringify(data.lastDurationAlert) : "None";

  log("Duration refreshed");
}

async function setDesired(lights) {
  await fetch("/manual/desired", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ lights })
  });

  log(`Manual desired set: ${lights}`);
  refreshShadow();
}


// ===== SEND MANUAL BRIGHTNESS =====
async function sendBrightness(value) {
  const res = await fetch("/sensor", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uv_visible: value })
  });

  const data = await res.json();
  log(`Brightness sent: ${value} → desired.lights = ${data.decidedDesired.lights}`);
  refreshShadow();
}


// ===== RUN ALERT TEST =====
async function runAlertTest() {
  await fetch("/test/alert", { method: "POST" });
  log("Started 30-second alert test");
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
