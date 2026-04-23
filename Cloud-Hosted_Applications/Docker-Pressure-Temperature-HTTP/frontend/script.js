// ---------------- CONFIG ----------------
const STATUS_URL = "/api/status"; // proxied to EC2-2
const ALERTS_URL = "/ctrl/alerts"; // proxied to EC2-2 controller
const FETCH_INTERVAL_MS = 10000; // Refresh every 10 seconds
// ----------------------------------------

// Utility to safely update text in an element
function updateElement(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

// ---------- Fetch /status from backend ----------
function fetchStatus() {
  fetch(STATUS_URL)
    .then(res => res.json())
    .then(updateStatus)
    .catch(err => console.error("UI fetch error:", err));
}

function updateStatus(info) {
  if (!info) return;

  // Sensors
  ["temperature", "pressure"].forEach(s => {
    const data = info[s];
    if (data) {
      document.getElementById(`${s}-value`).textContent = data.value;
      document.getElementById(`${s}-status`).textContent = data.status;
      document.getElementById(`${s}-lastseen`).textContent = data.lastSeenSecondsAgo + " s ago";
    }
  });

  // Valves
  ["cool_valve", "heat_valve", "pressureIn_valve", "pressureOut_valve"].forEach(v => {
    if (info[v]) document.getElementById(v).textContent = info[v];
  });
}

// Alerts
function fetchAlerts() {
fetch(ALERTS_URL)
    .then(res => res.json())
    .then(updateAlerts)
    .catch(err => console.error("UI alerts fetch error:", err));
}

function updateAlerts(alerts) {
  const ul = document.getElementById("alerts");
  ul.innerHTML = "";
  alerts.forEach(a => {
    const li = document.createElement("li");
    li.textContent = `[${new Date(a.timestamp).toLocaleTimeString()}] ${a.message}`;
    ul.appendChild(li);
  });
}

// Poll every 5s
setInterval(fetchStatus, 5000);
setInterval(fetchAlerts, 5000);

fetchStatus();
fetchAlerts();
