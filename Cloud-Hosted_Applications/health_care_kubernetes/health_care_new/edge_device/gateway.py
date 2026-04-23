import time
import requests
import random

# Configuration
# INGESTION_URL = "http://localhost:5001/ingest"

INGESTION_URL = "http://ingestion-service:5001/ingest"

def generate_sensor_data():
    """Simulates the Sensors Layer generating values."""
    return {
        "heart_rate": random.randint(40, 120),
        "spo2": random.randint(85, 100),
        "bp": random.randint(80, 140),
        "temp": round(random.uniform(35, 39), 1)
    }

def start_gateway():
    print("Gateway started. Sending data via HTTP POST...")
    while True:
        payload = generate_sensor_data()
        
        try:
            # Direct POST to the ingestion server
            response = requests.post(INGESTION_URL, json=payload)
            
            if response.status_code == 201:
                print(f"Success: Sent {payload}")
            else:
                print(f"Failed: {response.status_code} - {response.text}")
                
        except requests.exceptions.ConnectionError:
            print("Error: Could not connect to Ingestion Server. Is it running on port 5001?")

        time.sleep(3) # Wait 3 seconds before the next reading

if __name__ == "__main__":
    start_gateway()