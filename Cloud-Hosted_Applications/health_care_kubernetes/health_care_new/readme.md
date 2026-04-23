Execution Order
To get the full pipeline running smoothly, open three separate terminal windows and run them in this specific order:

Terminal 1: python backend/ingestion.py (Starts the receiver)

Terminal 2: python backend/api.py (Starts the frontend API)

Terminal 3: python edge_device/gateway.py (Starts sending data)

Finally, open frontend/index.html in your web browser.

==============================

Prerequisites Checklist
Before running any commands, ensure that:

Docker Desktop is open and running on Windows.

The Docker Desktop icon in your system tray shows a green background, indicating the engine and Kubernetes are running.

Step 1: Open Your Terminal & Navigate
Open your Ubuntu (WSL) terminal and navigate to your project directory. Remember to use the /mnt/c/ path to access your Windows files from Linux:

Bash
cd /mnt/c/Users/91955/Documents/Projects/Health_monitoring_system/HEALTH_care_new


Step 2: Build the Docker Images (First Time or After Code Changes)
Note: If you haven't changed any Python or HTML code since the last time you ran this, you can skip to 


Step 3.

Run these commands to build the four custom Docker images:

Bash
# Build the Gateway
docker build -t gateway-app ./edge_device

# Build the Backend Servers
docker build -t ingestion-app -f ./backend/Dockerfile.ingestion ./backend
docker build -t api-app -f ./backend/Dockerfile.api ./backend

# Build the Frontend Dashboard
docker build -t frontend-app ./frontend


Step 3: Deploy the Cluster
Apply your Kubernetes configuration file. This single command spins up the database, the backend servers, the gateway, and the frontend web server, all while wiring them together.

Bash
kubectl apply -f healthcare-cluster.yaml


Step 4: Verify the Services are Running
Check the status of your pods to ensure everything is starting up correctly:

Bash
kubectl get pods -w
(Wait until all five pods show a STATUS of Running. Press Ctrl+C to exit the watch mode).

If you ever need to troubleshoot or watch the live data streaming in, check the logs of your gateway or ingestion pods:

Bash
# Watch the Gateway sending data
kubectl logs -f deployment/gateway-app

# Watch the Ingestion server receiving and saving data
kubectl logs -f deployment/ingestion-app


Step 5: View Your Dashboard
Once the pods are running, Kubernetes routes the traffic to your Windows machine. Open your normal Windows web browser and navigate to:

👉 http://localhost:8081

You will see the latest sensor readings populating and refreshing automatically.


Step 6: Shutting It Down (Clean Up)
When you are done working and want to stop the system to free up your computer's memory, run this command in your terminal:

Bash
kubectl delete -f healthcare-cluster.yaml