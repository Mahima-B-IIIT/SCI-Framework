const http = require("http");

function randomFloat(min, max) {
  return parseFloat(
    Math.min(min + Math.random() * (max - min), max).toFixed(2)
  );
}

function sendPressure() {
  const data = JSON.stringify({
    sensor: "pressure",
    value: randomFloat(0.1, 10.1)
  });

  const options = {
    hostname: "server",
    port: 5000,
    path: "/ingest",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(data)
    }
  };

  const req = http.request(options, res => {
    res.on("data", () => {});
  });

  req.on("error", err => {
    console.error("❌ Pressure sensor error:", err.message);
  });

  req.write(data);
  req.end();
}

console.log("📡 Pressure sensor started");
setInterval(sendPressure, 10000);

