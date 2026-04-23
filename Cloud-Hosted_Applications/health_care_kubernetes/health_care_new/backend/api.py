from flask import Flask, jsonify
from pymongo import MongoClient
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

mongo = MongoClient("mongodb://mongodb:27017/")
db = mongo.healthcare
collection = db.records

@app.route("/api/latest")
def latest():
    data = list(collection.find().sort("timestamp", -1).limit(10))
    for d in data:
        d["_id"] = str(d["_id"])
        # Format the timestamp to a readable string
        d["timestamp"] = d["timestamp"].strftime("%Y-%m-%d %H:%M:%S")
    return jsonify(data)

if __name__ == '__main__':
    print("API Server started on port 5000")
    app.run(host="0.0.0.0", port=5000)