# Utiliza la imagen oficial de Python como base
FROM python:3.10-slim

# Establece variables de entorno para prevenir la generación de archivos .pyc y habilitar el buffer de salida
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Instala dependencias para Node.js (Next.js)
RUN apt-get update && apt-get install -y \
    curl \
    gnupg2 \
    lsb-release \
    ca-certificates

# Instala Node.js
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash - \
    && apt-get install -y nodejs

# Establece el directorio de trabajo en el contenedor
WORKDIR /app

COPY requirements.txt ./backend/requirements.txt

RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r backend/requirements.txt

# Copia el frontend de Next.js y las dependencias
COPY frontend/package.json frontend/package-lock.json ./frontend/

# Instala dependencias de Next.js
WORKDIR /app/frontend
RUN npm install

# Copia el código del backend y frontend al contenedor
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Copia el archivo .env del backend
COPY backend/.env ./backend/

# Expone los puertos para ambos servicios (Flask y Next.js)
EXPOSE 5000 3000

# Usamos un script de inicio para ejecutar ambos servicios (Flask + Next.js)
CMD ["sh", "-c", "python backend/app.py & cd frontend && npm run dev"]
