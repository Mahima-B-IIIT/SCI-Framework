const express = require("express");
const axios = require("axios");
const { MongoClient } = require("mongodb");

const app = express();
app.use(express.json());
console.log("🔥 index.js loaded");
const cors = require("cors");
app.use(cors());
// ---------------- CONFIG ----------------
const PORT = 5000;

const MONGO_URL = "mongodb://mongodb:27017";
const DB_NAME = "iot";
const COLLECTION = "data";

const CONTROLLER_URL = "http://controller:5001/control";

// Sensors are expected every 10s 
const SENSOR_TIMEOUT_MS = 15000;
const FAILURE_CHECK_INTERVAL_MS = 5000;
// ----------------------------------------

let db, collection;

// In-memory last-seen table (for failure detection)
const lastSeen = {};

// ---------- Mongo Connection ----------
async function connectDB() {
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  db = client.db(DB_NAME);
  collection = db.collection(COLLECTION);
  console.log("✅ Connected to MongoDB");
}
// ---------- Sensor Ingestion ----------
app.post("/ingest", async (req, res) => { //http://localhost:5000/ingest accepts POST requests from sensors
  try {
    const { sensor, value } = req.body;

    if (!sensor || value === undefined) {
      return res.status(400).json({ error: "sensor and value required" });
    }

    const now = new Date();

    // 1️⃣ Persist sensor data
    await collection.updateOne( //Updates the sensor data in the MongoDB collection
      { _id: sensor },
      {
        $set: {
          value: value,
          timestamp: now,
          status: "OK"
        }
      },
      { upsert: true }
    );

    // 2️⃣ Update last-seen time (for failure detection)
    lastSeen[sensor] = Date.now();

    // 3️⃣ Forward data to controller
    await axios.post(CONTROLLER_URL, {  //Forwards the sensor data to the controller service via HTTP POST request
      sensor,
      value,
      timestamp: now
    });

    console.log(`📥 ${sensor} = ${value}`);
    res.json({ status: "ok" });

  } catch (err) {
    console.error("❌ Ingestion error:", err.message);
    res.status(500).json({ error: "ingestion failed" });
  }
});

// ---------- Sensor Failure Detection ----------
async function detectSensorFailures() {
  const now = Date.now();

  for (const sensor in lastSeen) {
    const delta = now - lastSeen[sensor];

    if (delta > SENSOR_TIMEOUT_MS) {
      // Mark sensor as FAILED in DB
      await collection.updateOne(  //updates the status of the sensor to "FAILED" in the MongoDB collection if it has not sent data within the expected timeframe
        { _id: sensor },
        {
          $set: {
            status: "FAILED",
            failedAt: new Date()
          }
        }
      );

      console.warn(`⚠️ Sensor FAILED: ${sensor}`);

      // Remove from lastSeen to avoid repeated updates
      delete lastSeen[sensor];
    }
  }
}

// ---------- Health Check ----------
app.get("/health", (req, res) => {
  res.send("Ingestion service running");
});


// ---------- Status Endpoint ----------
app.get("/status", async (req, res) => {
  try {
    const docs = await collection.find({}).toArray();
    const status = {};
    
    docs.forEach(doc => {
      if (doc._id.includes("valve")) {
        status[doc._id] = doc.valve_on ? "OPEN" : "CLOSED";
      } else {
        const lastSeenMs = Date.now() - (lastSeen[doc._id] || 0);
        status[doc._id] = {
          value: doc.value,
          status: doc.status,
          lastSeenSecondsAgo: lastSeenMs > 0 ? Math.floor(lastSeenMs / 1000) : null
        };
      }
    });

    res.json(status);
  } catch (err) {
    console.error("❌ Status error:", err.message);
    res.status(500).json({ error: "status fetch failed" });
  }
});


// ---------- Start Server ----------
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 index.js running on http://localhost:${PORT}`);
  });

  // Periodic failure detection loop
  setInterval(detectSensorFailures, FAILURE_CHECK_INTERVAL_MS);
});

