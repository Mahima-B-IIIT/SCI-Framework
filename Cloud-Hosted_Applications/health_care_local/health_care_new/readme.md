Execution Order
To get the full pipeline running smoothly, open three separate terminal windows and run them in this specific order:

Terminal 1: python backend/ingestion.py (Starts the receiver)

Terminal 2: python backend/api.py (Starts the frontend API)

Terminal 3: python edge_device/gateway.py (Starts sending data)

Finally, open frontend/index.html in your web browser.