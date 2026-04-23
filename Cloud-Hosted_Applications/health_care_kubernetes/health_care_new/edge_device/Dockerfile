FROM python:3.9-slim
WORKDIR /app
# Gateway only needs the requests library
RUN pip install requests 
COPY gateway.py .
CMD ["python", "-u", "gateway.py"]