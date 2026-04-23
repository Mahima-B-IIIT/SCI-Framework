const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
app.use(express.json());
const cors = require("cors");
app.use(cors());

// ---------------- CONFIG ----------------
const PORT = 5001;
const CONTROL_INTERVAL_MS = 10000;
const MONGO_URL = "mongodb://mongodb:27017";
const DB_NAME = "iot";
const COLLECTION = "data";
// ----------------------------------------

// In-memory state table
const table = {};
const alerts = [];

let collection;

// ---------- Mongo Connection ----------
async function connectDB() {
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  const db = client.db(DB_NAME);
  collection = db.collection(COLLECTION);
  console.log("🧠 Controller connected to MongoDB");
}
// ---------- Receive Sensor Updates ----------
app.post("/control", (req, res) => {
  const { sensor, value } = req.body;

  if (!sensor || value === undefined) {
    return res.status(400).json({ error: "sensor and value required" });
  }

  table[sensor] = value;
  res.json({ status: "received" });
});
// ---------- Control Loop ----------
setInterval(() => {
  check_and_act(table);
}, CONTROL_INTERVAL_MS);

// ---------- Control Logic ----------
function check_and_act(table) {
  check_and_act_for_temperature(table);
  check_and_act_for_pressure(table);
}
function sendSNS(message) {
  console.log("SNS Notification:", message);
  alerts.push({ message, timestamp: new Date() });

}

function check_and_act_for_temperature(table) {
  if (table.temperature === undefined) return;

  if (
    !isTemperatureGreaterThanMax(table.temperature) &&
    !isTemperatureLessThanMin(table.temperature)
  ) {
    if (table.cool_valve) updateValve("cool_valve", false);
    if (table.heat_valve) updateValve("heat_valve", false);
    return;
  }

  if (isTemperatureGreaterThanMax(table.temperature) && !table.cool_valve) {
    updateValve("cool_valve", true);
    updateValve("heat_valve", false);
  }

  if (isTemperatureLessThanMin(table.temperature) && !table.heat_valve) {
    updateValve("heat_valve", true);
    updateValve("cool_valve", false);
  }
if(isTemperatureGreaterThanMax(table.temperature) && table.cool_valve) {
    sendSNS(`Temperature is too high: ${table.temperature}°C. Cooling valve is OPEN.`);
    
  }
  
  if(isTemperatureLessThanMin(table.temperature) && table.heat_valve) {
    sendSNS(`Temperature is too low: ${table.temperature}°C. Heating valve is OPEN.`);
  }
}

function check_and_act_for_pressure(table) {
  if (table.pressure === undefined) return;

  if (
    !isPressureGreaterThanMax(table.pressure) &&
    !isPressureLessThanMin(table.pressure)
  ) {
    if (table.pressureIn_valve) updateValve("pressureIn_valve", false);
    if (table.pressureOut_valve) updateValve("pressureOut_valve", false);
    return;
  }

  if (isPressureGreaterThanMax(table.pressure) && !table.pressureOut_valve) {
    updateValve("pressureOut_valve", true);
    updateValve("pressureIn_valve", false);
  }

  if (isPressureLessThanMin(table.pressure) && !table.pressureIn_valve) {
    updateValve("pressureIn_valve", true);
    updateValve("pressureOut_valve", false);
  }

  if(isPressureGreaterThanMax(table.pressure) && table.pressureOut_valve) {
    sendSNS(`Pressure is too high: ${table.pressure} atm. Pressure OUT valve is OPEN.`);
  }
  if(isPressureLessThanMin(table.pressure) && table.pressureIn_valve) {
    sendSNS(`Pressure is too low: ${table.pressure} atm. Pressure IN valve is OPEN.`);
  }
}

// ---------- Thresholds ----------
function isTemperatureGreaterThanMax(t) {
  return t > 95;
}

function isTemperatureLessThanMin(t) {
  return t < 15;
}

function isPressureGreaterThanMax(p) {
  return p > 8.1;
}

function isPressureLessThanMin(p) {
  return p < 2.1;
}
// ---------- Valve Actuation ----------
async function updateValve(valve, state) {
  try {
    table[valve] = state;

    await collection.updateOne(
      { _id: valve },
      {
        $set: {
          valve_on: state,
          timestamp: new Date()
        }
      },
      { upsert: true }
    );

    console.log(`🔧 Valve ${valve} → ${state ? "OPEN" : "CLOSED"}`);
  } catch (err) {
    console.error("❌ Valve command failed:", err.message);
  }
}
//app.get("/log", (req, res) => {
  //res.json(table); // returns current sensor + valve states
//});

app.get("/alerts", (req, res) => {
  res.json(alerts.slice(-3)); // last 10 alerts
});

// ---------- Start ----------
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🧠 Controller running on http://localhost:${PORT}`);
  });
});

