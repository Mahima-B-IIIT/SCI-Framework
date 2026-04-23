import os
import time
import paho.mqtt.client as mqtt

BROKER = os.getenv("MQTT_BROKER", "mosquitto")

client = mqtt.Client()

while True:
    try:
        client.connect(BROKER, 1883, 60)
        print(f"[GATEWAY] Connected to MQTT broker at {BROKER}", flush=True)
        break
    except Exception as e:
        print(f"[GATEWAY] MQTT not ready ({BROKER}), retrying in 5s... {e}", flush=True)
        time.sleep(5)

client.loop_forever()




# import paho.mqtt.client as mqtt

# BROKER = "localhost"
# TOPIC = "sensors/healthcare"

# client = mqtt.Client()
# client.connect(BROKER, 1883, 60)

# client.loop_forever()
