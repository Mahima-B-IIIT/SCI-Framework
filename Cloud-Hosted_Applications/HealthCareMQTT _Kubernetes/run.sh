#!/usr/bin/env bash
set -e

echo "🚀 Starting Healthcare MQTT Kubernetes App..."

# 1. Check Minikube status
if ! minikube status >/dev/null 2>&1; then
  echo "🔄 Starting Minikube..."
  minikube start
else
  echo "✅ Minikube is already running"
fi

# 2. Apply Kubernetes manifests
echo "📦 Applying Kubernetes manifests..."
kubectl apply -f healthcare_mqtt.yaml

# 3. Wait for backend & frontend to be ready
echo " Waiting for backend and frontend pods to be ready..."
kubectl wait --for=condition=available deployment/backend --timeout=120s
kubectl wait --for=condition=available deployment/frontend --timeout=120s

# 4. Port-forward backend to localhost:5000 (background)
echo " Port-forwarding backend service to localhost:5000 ..."
kubectl port-forward svc/backend 5000:5000 >/tmp/backend-portforward.log 2>&1 &
PF_PID=$!

# 5. Give port-forward a moment to start
sleep 3

# 6. Open frontend in browser
echo "🌐 Opening frontend in browser..."
minikube service frontend

echo ""
echo "🎉App is running!"
echo "📌 Backend API: http://localhost:5000/api/latest"
echo "📌 Frontend UI opened in your browser"
echo ""
echo "⚠️ Press Ctrl+C to stop port-forward when done."

# 7. Keep script alive so port-forward stays active
wait $PF_PID