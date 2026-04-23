const http = require("http");

function randomFloat(min, max) {
  return parseFloat(
    Math.min(min + Math.random() * (max - min), max).toFixed(2)
  );
}

function sendTemperature() {
  const data = JSON.stringify({
    sensor: "temperature",
    value: randomFloat(5, 110)
  });

  const options = {
    hostname: "localhost",
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
    console.error("❌ Temperature sensor error:", err.message);
  });

  req.write(data);
  req.end();
}

console.log("📡 Temperature sensor started");
setInterval(sendTemperature, 10000);