# Etapa 1: Build de Angular
FROM node:20-alpine AS builder

WORKDIR /app

# Copiamos package.json y package-lock.json (mejor para cache)
COPY package*.json ./

# Instalamos dependencias
RUN npm install --legacy-peer-deps

# Copiamos el resto del código fuente
COPY . .

# Compilamos la app Angular en modo producción
RUN npm run build --configuration=production

# Etapa 2: Servidor NGINX para servir la app
FROM nginx:alpine

# Elimina la configuración por defecto
RUN rm /etc/nginx/conf.d/default.conf

# Copiamos la build al directorio por defecto de nginx
COPY --from=builder /app/dist/template/browser /usr/share/nginx/html

# Copiamos una configuración de nginx custom para SPA (manejo de rutas)
#COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/nginx.conf
# Exponemos el puerto 80
EXPOSE 80

# Iniciamos nginx
CMD ["nginx", "-g", "daemon off;"]
