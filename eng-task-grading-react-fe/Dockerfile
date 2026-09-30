# --- Stage 1: build ---
FROM node:20-alpine AS build

WORKDIR /app

# Build-time config passed from docker-compose (build.args); process env overrides .env.production in Vite.
# Args that are not passed stay unset, so the values from .env.production are used.
ARG VITE_BACKEND_URL
ARG VITE_CLOUDFLARE_ENABLED

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
