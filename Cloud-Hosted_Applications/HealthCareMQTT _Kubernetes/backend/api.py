from flask import Flask, jsonify
from pymongo import MongoClient
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

mongo = MongoClient("mongodb://localhost:27017/")
db = mongo.healthcare
collection = db.records

@app.route("/api/latest")
def latest():
    data = list(collection.find().sort("timestamp", -1).limit(10))
    for d in data:
        d["_id"] = str(d["_id"])
        d["timestamp"] = d["timestamp"].isoformat()
    return jsonify(data)

app.run(debug=True, port=5000)
