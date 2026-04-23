// server.js
import express from "express";
import morgan from "morgan";

// ===== In-memory Shadow Store =====
const shadow = {
  desired: null,
  reported: {
    lights: false,
    lightOffTimestamp: new Date().toISOString()
  }
};

let lastDurationAlert = null;

// Threshold logic
const BRIGHTNESS_OFF_THRESHOLD = 700;

// ===== Alert Test Mode =====
let alertTestActive = false;

// Compute delta for bulb
function computeDelta() {
  if (!shadow.desired) return null;
  const d = shadow.desired.lights;
  const r = shadow.reported.lights;
  if (typeof d === "boolean" && d !== r) {
    return { state: { lights: d } };
  }
  return null;
}

function secondsSinceLastOff() {
  const ts = shadow.reported.lightOffTimestamp
    ? new Date(shadow.reported.lightOffTimestamp)
    : null;
  if (!ts) return null;
  return Math.floor((Date.now() - ts.getTime()) / 1000);
}

const app = express();
app.use(express.json());
app.use(morgan("dev"));
app.use(express.static("public"));


// ===== SENSOR ENDPOINT =====
// Body: { uv_visible: number }
app.post("/sensor", (req, res) => {
  const { uv_visible } = req.body || {};

  if (typeof uv_visible !== "number") {
    return res.status(400).json({ error: "uv_visible (number) required" });
  }

  // If alert test mode is active, ignore random brightness and force lights ON
  if (alertTestActive) {
    shadow.desired = { lights: true };
    return res.json({
      ok: true,
      testMode: true,
      decidedDesired: shadow.desired,
      note: "Alert test active — forcing lights ON"
    });
  }

  // Normal behavior
  const lights = uv_visible > BRIGHTNESS_OFF_THRESHOLD ? false : true;
  shadow.desired = { lights };

  return res.json({
    ok: true,
    decidedDesired: shadow.desired,
    note: `Brightness=${uv_visible}. Desired.lights = ${lights}`
  });
});


// ===== BULB GETS DELTA =====
app.get("/commands/delta", (req, res) => {
  return res.json({ delta: computeDelta() });
});


// ===== BULB REPORTS STATE =====
app.post("/shadow/report", (req, res) => {
  const { lights, lightOffTimestamp } = req.body || {};
  if (typeof lights !== "boolean") {
    return res.status(400).json({ error: "lights (boolean) required" });
  }

  shadow.reported.lights = lights;

  if (lights === false) {
    shadow.reported.lightOffTimestamp =
      lightOffTimestamp || new Date().toISOString();
  }

  if (shadow.desired && shadow.desired.lights === lights) {
    shadow.desired = null;
  }

  return res.json({ ok: true, reported: shadow.reported, desired: shadow.desired });
});


// ===== READ SHADOW =====
app.get("/shadow", (req, res) => {
  res.json({ shadow, delta: computeDelta() });
});


// ===== DURATION INFO =====
app.get("/duration", (req, res) => {
  const seconds = secondsSinceLastOff();
  res.json({
    secondsSinceLastOff: seconds,
    lastDurationAlert
  });
});


// ===== ALERT CHECKER (every 1s, threshold = 30s) =====
const ALERT_THRESHOLD_SEC = 30;

setInterval(() => {
  const sec = secondsSinceLastOff();
  if (sec !== null && sec >= ALERT_THRESHOLD_SEC && shadow.reported.lights) {
    lastDurationAlert = {
      at: new Date().toISOString(),
      lightOnDurationSeconds: sec
    };
    console.log("[ALERT] Light has been ON for >= 30 seconds:", lastDurationAlert);
  }
}, 1000);


// ===== MANUAL DESIRED =====
app.post("/manual/desired", (req, res) => {
  const { lights } = req.body || {};
  if (typeof lights !== "boolean") {
    return res.status(400).json({ error: "lights (boolean) required" });
  }

  shadow.desired = { lights };
  return res.json({
    ok: true,
    message: `Manual override: desired.lights = ${lights}`,
    desired: shadow.desired
  });
});


// ===== RUN 30-SECOND ALERT TEST =====
app.post("/test/alert", (req, res) => {
  alertTestActive = true;

  // Force ON
  shadow.desired = { lights: true };

  // Stop test after 40 seconds
  setTimeout(() => {
    alertTestActive = false;
    console.log("[TEST] Alert test finished. Resuming normal random behavior.");
  }, 40_000);

  return res.json({ ok: true, message: "Alert test started (40 seconds duration)" });
});


// ===== START SERVER =====
const PORT = process.env.PORT || 3000;
app.use(express.static("frontend"));
app.listen(PORT, () => {
  console.log(`HTTP broker server running on http://localhost:${PORT}`);
});
