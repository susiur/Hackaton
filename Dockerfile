# Usa una imagen oficial de Node.js como base
FROM node:18-alpine

# Establece el directorio de trabajo en el contenedor
WORKDIR /app

# Copia solo los archivos esenciales para instalar las dependencias
COPY package.json .
COPY package-lock.json .

# Instala las dependencias
RUN npm install

# Ejecuta Prisma Generate para generar el cliente de Prisma
RUN npx prisma generate

# Copia el resto de los archivos del proyecto
COPY . .

RUN npm run build

# Expone el puerto que usa tu aplicación (por defecto, Next.js usa el puerto 3000)
EXPOSE 3000

# Comando para correr la aplicación
CMD ["npm", "start"]
