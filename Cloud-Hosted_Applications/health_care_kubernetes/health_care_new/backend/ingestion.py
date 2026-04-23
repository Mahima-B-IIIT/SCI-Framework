import json
from flask import Flask, request, jsonify
from pymongo import MongoClient
from datetime import datetime

app = Flask(__name__)

# Database Setup
mongo = MongoClient("mongodb://mongodb:27017/")
db = mongo.healthcare
collection = db.records

def check_status(data):
    alerts = []
    
    # Thresholds based on system specifications
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

@app.route('/ingest', methods=['POST'])
def ingest_data():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No data provided"}), 400

        status, alerts = check_status(data)

        record = {
            "timestamp": datetime.utcnow(),
            "data": data,
            "status": status,
            "alerts": alerts
        }

        collection.insert_one(record)

        print(f"Received: {data} | Status: {status}")
        if alerts:
            print(f"ALERTS: {alerts}")

        return jsonify({"message": "Data ingested successfully", "status": status}), 201

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("HTTP Ingestion Server started on port 5001")
    app.run(host="0.0.0.0", port=5001)