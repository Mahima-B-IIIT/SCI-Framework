🏥 Healthcare MQTT Monitoring System (Kubernetes)
=================================================

This project implements an IoT-based healthcare monitoring pipeline using **MQTT, MongoDB, Python, Docker, and Kubernetes (Minikube)**.Sensor data is simulated, sent via MQTT, ingested by a backend service, stored in MongoDB, and displayed on a web frontend.

▶️ How to Run (One Command)
---------------------------

> Make sure Docker, kubectl, and Minikube are installed.

`   chmod +x run.sh  ./run.sh   `

This script will:

*   Start Minikube (if not running)
    
*   Deploy all Kubernetes resources
    
*   Port-forward backend to localhost:5000
    
*   Open the frontend UI in your browser
    



🧠 What the System Does (In Short)
----------------------------------

*   sensor.py generates vitals (HR, SpO2, BP, Temperature)
    
*   gateway.py publishes data to MQTT (Mosquitto)
    
*   ingestion.py subscribes to MQTT and stores data in MongoDB
    
*   Flask API exposes /api/latest
    
*   Frontend fetches latest data and displays it
    
*   All services run as containers managed by Kubernetes
    

🔎 Useful Commands (Optional)
-----------------------------

`   kubectl get pods  kubectl logs deployment/backend  kubectl logs deployment/edge-device  kubectl port-forward svc/backend 5000:5000   `

