# --- Stage 1: build ---
FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Stage 2: serve ---
FROM nginx:1.25-alpine

# smažeme defaultní web a nahradíme ho buildem
COPY certs /etc/nginx/certs
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist /usr/share/nginx/html

# SPA fallback pro TanStack Router / React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
