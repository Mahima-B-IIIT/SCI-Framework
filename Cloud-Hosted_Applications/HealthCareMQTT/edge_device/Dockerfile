FROM python:3.10-slim

WORKDIR /app

COPY gateway.py sensor.py ./

RUN pip install paho-mqtt

CMD ["sh", "-c", "python sensor.py & python gateway.py"]
