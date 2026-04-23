FROM python:3.10-slim

WORKDIR /app
COPY ingestion.py ./

RUN pip install paho-mqtt pymongo flask flask-cors

EXPOSE 5000

CMD ["python", "ingestion.py"]



# FROM python:3.10-slim

# WORKDIR /app

# COPY ingestion.py api.py ./

# RUN pip install paho-mqtt pymongo flask flask-cors

# EXPOSE 5000

# CMD ["sh", "-c", "python ingestion.py & python api.py"]
