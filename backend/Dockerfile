
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .

RUN apt-get update && \
    apt-get install -y gcc default-libmysqlclient-dev pkg-config && \
    rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["python", "app.py"]