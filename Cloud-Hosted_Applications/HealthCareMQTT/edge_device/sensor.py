import random
import time
import json
import os
import sys
import paho.mqtt.client as mqtt

BROKER = os.getenv("MQTT_BROKER", "mosquitto")
TOPIC = "sensors/healthcare"

client = mqtt.Client()

while True:
    try:
        client.connect(BROKER, 1883, 60)
        print(f"[SENSOR] Connected to MQTT broker at {BROKER}", flush=True)
        break
    except Exception as e:
        print(f"[SENSOR] MQTT not ready ({BROKER}), retrying in 5s... {e}", flush=True)
        time.sleep(5)

def generate_data():
    return {
        "heart_rate": random.randint(40, 120),
        "spo2": random.randint(85, 100),
        "bp": random.randint(80, 140),
        "temp": round(random.uniform(35, 39), 1)
    }

while True:
    data = generate_data()
    client.publish(TOPIC, json.dumps(data))
    print(f"[SENSOR] Published: {data}", flush=True)
    time.sleep(3)



# import random
# import time
# import json
# import paho.mqtt.client as mqtt

# BROKER = "localhost"
# TOPIC = "sensors/healthcare"

# client = mqtt.Client()
# client.connect(BROKER, 1883, 60)

# def generate_data():
#     return {
#         "heart_rate": random.randint(40, 120),
#         "spo2": random.randint(85, 100),
#         "bp": random.randint(80, 140),
#         "temp": round(random.uniform(35, 39), 1)
#     }

# while True:
#     data = generate_data()
#     client.publish(TOPIC, json.dumps(data))
#     print("Published:", data)
#     time.sleep(3)
