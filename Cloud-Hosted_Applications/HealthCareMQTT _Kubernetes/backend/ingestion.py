import os
import json
import time
import threading
from datetime import datetime

import paho.mqtt.client as mqtt
from pymongo import MongoClient
from flask import Flask, jsonify
from flask_cors import CORS

# -------- Config --------
BROKER = os.getenv("MQTT_BROKER", "mosquitto")
MONGO_URI = os.getenv("MONGO_URI", "mongodb://mongo:27017")
TOPIC = "sensors/healthcare"

# -------- Mongo --------
mongo = MongoClient(MONGO_URI)
db = mongo.healthcare
collection = db.records

# -------- Flask --------
app = Flask(__name__)
CORS(app)

@app.route("/api/latest")
def latest():
    data = list(collection.find().sort("timestamp", -1).limit(10))
    for d in data:
        d["_id"] = str(d["_id"])
        d["timestamp"] = d["timestamp"].isoformat()
    return jsonify(data)

# -------- MQTT Subscriber --------
def start_mqtt():
    client = mqtt.Client()

    while True:
        try:
            client.connect(BROKER, 1883, 60)
            print(f"[BACKEND] Connected to MQTT broker at {BROKER}", flush=True)
            break
        except Exception as e:
            print(f"[BACKEND] MQTT not ready ({BROKER}), retrying in 5s... {e}", flush=True)
            time.sleep(5)

    def check_status(data):
        alerts = []
        if data["heart_rate"] < 50 or data["heart_rate"] > 100:
            alerts.append("Heart Rate abnormal")
        if data["spo2"] < 95:
            alerts.append("SpO2 low")
        if data["bp"] < 90 or data["bp"] > 120:
            alerts.append("BP abnormal")
        if data["temp"] < 36.5 or data["temp"] > 37.5:
            alerts.append("Temperature abnormal")
        status = "normal" if not alerts else "abnormal"
        return status, alerts
    
    def on_message(client, userdata, msg):
        data = json.loads(msg.payload.decode())
        status, alerts = check_status(data)
        record = {
            "timestamp": datetime.utcnow(),
            "data": data,
            "status": status,
            "alerts": alerts
        }
        collection.insert_one(record)
        # record = {
        #     "timestamp": datetime.utcnow(),
        #     "data": data
        # }
        # collection.insert_one(record)
        print(f"[BACKEND] Inserted record: {data}", flush=True)

    client.subscribe(TOPIC)
    client.on_message = on_message
    client.loop_forever()

# -------- Start MQTT thread + Flask --------
if __name__ == "__main__":
    threading.Thread(target=start_mqtt, daemon=True).start()
    print("[BACKEND] Starting API server on 0.0.0.0:5000", flush=True)
    app.run(host="0.0.0.0", port=5000, debug=False)



# import os
# import json
# import time
# import threading
# from datetime import datetime

# import paho.mqtt.client as mqtt
# from pymongo import MongoClient
# from flask import Flask, jsonify
# from flask_cors import CORS

# # ---- Config ----
# BROKER = os.getenv("MQTT_BROKER", "mosquitto")
# MONGO_URI = os.getenv("MONGO_URI", "mongodb://mongo:27017")
# TOPIC = "sensors/healthcare"

# # ---- Mongo ----
# mongo = MongoClient(MONGO_URI)
# db = mongo.healthcare
# collection = db.records

# # ---- Flask API ----
# app = Flask(__name__)
# CORS(app)

# @app.route("/api/latest")
# def latest():
#     data = list(collection.find().sort("timestamp", -1).limit(10))
#     for d in data:
#         d["_id"] = str(d["_id"])
#         d["timestamp"] = d["timestamp"].isoformat()
#     return jsonify(data)

# # ---- MQTT Subscriber ----
# def start_mqtt():
#     client = mqtt.Client()

#     while True:
#         try:
#             client.connect(BROKER, 1883, 60)
#             print(f"[BACKEND] Connected to MQTT broker at {BROKER}", flush=True)
#             break
#         except Exception as e:
#             print(f"[BACKEND] MQTT not ready ({BROKER}), retrying in 5s... {e}", flush=True)
#             time.sleep(5)

#     def on_message(client, userdata, msg):
#         data = json.loads(msg.payload.decode())
#         record = {
#             "timestamp": datetime.utcnow(),
#             "data": data
#         }
#         collection.insert_one(record)
#         print(f"[BACKEND] Inserted record: {data}", flush=True)

#     client.subscribe(TOPIC)
#     client.on_message = on_message
#     client.loop_forever()

# # ---- Start MQTT in background thread ----
# threading.Thread(target=start_mqtt, daemon=True).start()

# # ---- Start Flask ----
# if __name__ == "__main__":
#     print("[BACKEND] Starting API server on 0.0.0.0:5000", flush=True)
#     app.run(host="0.0.0.0", port=5000, debug=True)



# import json
# from pymongo import MongoClient
# import paho.mqtt.client as mqtt
# from datetime import datetime

# BROKER = "localhost"
# TOPIC = "sensors/healthcare"

# mongo = MongoClient("mongodb://localhost:27017/")
# db = mongo.healthcare
# collection = db.records

# def check_status(data):
#     alerts = []

#     if data["heart_rate"] < 50 or data["heart_rate"] > 100:
#         alerts.append("Heart Rate abnormal")
#     if data["spo2"] < 95:
#         alerts.append("SpO2 low")
#     if data["bp"] < 90 or data["bp"] > 120:
#         alerts.append("BP abnormal")
#     if data["temp"] < 36.5 or data["temp"] > 37.5:
#         alerts.append("Temperature abnormal")

#     status = "normal" if not alerts else "abnormal"
#     return status, alerts

# def on_message(client, userdata, msg):
#     data = json.loads(msg.payload.decode())
#     status, alerts = check_status(data)

#     record = {
#         "timestamp": datetime.utcnow(),
#         "data": data,
#         "status": status,
#         "alerts": alerts
#     }

#     collection.insert_one(record)

#     print("Received:", data)
#     print("Status:", status)
#     if alerts:
#         print("ALERTS:", alerts)

# client = mqtt.Client()
# client.connect(BROKER, 1883, 60)
# client.subscribe(TOPIC)
# client.on_message = on_message

# print("Ingestion Server started ")
# client.loop_forever()
