// ---------------- CONFIG ----------------
const STATUS_URL = "/api/status"; // proxied to EC2 backend
const ALERTS_URL = "/ctrl/alerts"; // proxied to controller
const POLL_INTERVAL_MS = 1000; // 1s refresh
const MAX_HISTORY = 60; // Keep last 60 readings
//-----------------------------------------

const sensorHistory = { temperature: [], pressure: [] };

// ---------------- UTILITY ----------------
function updateElement(id, text, className = null) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = text;
    if (className) el.className = className;
  }
}

function timeAgoString(date) {
  const diff = Date.now() - date;
  const sec = Math.floor(diff / 1000);
  return sec < 60 ? `${sec}s ago` : `${Math.floor(sec / 60)}m ago`;
}

// ---------------- SPARKLINE ----------------
function updateSparkline(canvas, data, color) {
  if (!canvas || !data.length) return;

  const ctx = canvas.getContext("2d");
  canvas.width = canvas.offsetWidth;
  canvas.height = 60;
  const width = canvas.width;
  const height = canvas.height;

  ctx.clearRect(0, 0, width, height);
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.shadowBlur = 10;
  ctx.shadowColor = color;
ctx.beginPath();

  if (data.length < 2) return;
  const values = data.map(d => d.value).filter(v => v != null);
  if (!values.length) return;

  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  data.forEach((point, i) => {
    if (point.value == null) return;
    const x = (i / (data.length - 1)) * (width - 20) + 10;
    const y = height - 10 - ((point.value - min) / range) * (height - 20);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
}

// ---------------- CONNECTION STATUS ----------------
function setConnection(connected) {
  updateElement(
    "connection-status",
    connected ? "🟢 LIVE" : "🔴 DISCONNECTED",
    `connection-status ${connected ? "connected" : "disconnected"}`
  );
}

// ---------------- FETCH STATUS ----------------
async function fetchStatus() {
  try {
    const res = await fetch(STATUS_URL);
    if (!res.ok) throw new Error(res.status);
    const status = await res.json();
    updateStatus(status);
    setConnection(true);
  } catch (e) {
    console.error("Status fetch failed:", e);
    setConnection(false);
}
}

// ---------------- UPDATE STATUS ----------------
function updateStatus(status) {
  if (!status) return;

  // Temperature
  if (status.Temperature?.value != null) {
    sensorHistory.temperature.push({ value: status.Temperature.value, time: Date.now() });
    if (sensorHistory.temperature.length > MAX_HISTORY) sensorHistory.temperature.shift();

    updateElement("temp-value", `${status.Temperature.value.toFixed(1)} °C`);
    updateElement("temp-status", status.Temperature.status);

    updateSparkline(document.getElementById("temp-chart"), sensorHistory.temperature, "#ff6b35");
  }

  // Pressure
  if (status.Pressure?.value != null) {
    sensorHistory.pressure.push({ value: status.Pressure.value, time: Date.now() });
    if (sensorHistory.pressure.length > MAX_HISTORY) sensorHistory.pressure.shift();

    updateElement("pressure-value", `${status.Pressure.value.toFixed(1)} bar`);
    updateElement("pressure-status", status.Pressure.status);

    updateSparkline(document.getElementById("pressure-chart"), sensorHistory.pressure, "#4ecdc4");
  }

  // Valves
  const valveIdMap = {
    heat_valve: "heat-valve-status",
    cool_valve: "cool-valve-status",
    pressureIn_valve: "pressure-in-valve-status",
    pressureOut_valve: "pressure-out-valve-status"
  };
Object.entries(valveIdMap).forEach(([key, elId]) => {
    if (status[key] !== undefined && status[key] !== null) {
      updateElement(
        elId,
        status[key],
        `valve-status ${status[key] === "OPEN" ? "open" : "closed"}`
      );
    }
  });
}

// ---------------- FETCH ALERTS ----------------
async function fetchAlerts() {
  try {
    const res = await fetch(ALERTS_URL);
    if (!res.ok) throw new Error(res.status);
    const alerts = await res.json();
    updateAlerts(alerts);
  } catch (e) {
    console.error("Alerts fetch failed:", e);
  }
}

function updateAlerts(alerts) {
  const ul = document.getElementById("alerts-list");
  if (!ul) return;
  ul.innerHTML = "";
  alerts.slice(-5).reverse().forEach(alert => {
    const div = document.createElement("div");
    div.className = "alert-item";
    const timeAgo = timeAgoString(new Date(alert.timestamp));
    div.innerHTML = `<div style="font-weight:600; color:#2c3e50;">${alert.message}</div>
                     <div style="color:#6c757d; font-size:0.9em;">${timeAgo}</div>`;
    ul.appendChild(div);
  });
}

// ---------------- START REALTIME ----------------
function startRealtime() {
  fetchStatus();
  fetchAlerts();
  setInterval(fetchStatus, POLL_INTERVAL_MS);
  setInterval(fetchAlerts, POLL_INTERVAL_MS);
}

// ---------------- INIT ----------------
document.addEventListener("DOMContentLoaded", startRealtime);

