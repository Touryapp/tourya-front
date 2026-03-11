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

# Copiamos el template de nginx
COPY nginx.conf /etc/nginx/nginx.conf.template

# Puerto por defecto (80 para AWS, Cloud Run inyecta 8080 automaticamente)
ENV PORT=80

# Al arrancar: reemplaza ${PORT} en el template y lanza nginx
CMD sh -c "envsubst '\$PORT' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf && nginx -g 'daemon off;'"
