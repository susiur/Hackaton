# Utiliza la imagen oficial de Python como base
FROM python:3.10-slim

# Establece variables de entorno para prevenir la generación de archivos .pyc y habilitar el buffer de salida
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Establece el directorio de trabajo en el contenedor
WORKDIR /app

# Copia el archivo de dependencias y lo instala
COPY requirements.txt .

RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copia el resto del código de la aplicación al contenedor
COPY . .

# Copia el archivo .env al contenedor
COPY backend/.env .

# Expone el puerto en el que correrá la aplicación Flask
EXPOSE 5000

# Define el comando por defecto para ejecutar la aplicación
CMD ["python", "app.py"]