# Build stage (Node 24+; aligns with package.json engines and jsdom 29 / Cypress)
FROM node:24-alpine AS build

ENV NPM_CONFIG_UPDATE_NOTIFIER=false
ENV CYPRESS_INSTALL_BINARY=0

WORKDIR /app

COPY package.json package-lock.json ./

ARG VITE_IDP_LOGIN_URI=http://127.0.0.1:8080/login.html
ENV VITE_IDP_LOGIN_URI=$VITE_IDP_LOGIN_URI

# Resolve locked packages with registry-scoped auth confined to this install step.
RUN --mount=type=secret,id=github_npm_token,required=true \
    --mount=type=tmpfs,target=/run/npm-config \
    --mount=type=cache,target=/root/.npm \
    printf '%s\n' '@mentor-forge:registry=https://npm.pkg.github.com' \
      '//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}' > /run/npm-config/npmrc && \
    GITHUB_TOKEN="$(cat /run/secrets/github_npm_token)" \
      NPM_CONFIG_USERCONFIG=/run/npm-config/npmrc npm ci

COPY . .
RUN --mount=type=cache,target=/app/node_modules/.vite \
    npm run build

RUN DATE=$(date "+%Y-%m-%d:%H:%M:%S") && echo "$DATE" > ./dist/patch.txt

# Deploy stage
FROM nginx:1.30.7-alpine@sha256:caf4e1e032a20f9c3c5e28fc7f25ffd768ad8677b4975c54193075997b3a97e3

LABEL org.opencontainers.image.source="https://github.com/mentor-forge/mentorhub_mentor_spa"

ENV API_HOST=mentorhub_mentor_api
ENV API_PORT=8391
ENV IDP_LOGIN_URI=http://127.0.0.1:8080/login.html

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/nginx.conf.template

# envsubst for runtime nginx config (API_HOST/API_PORT in proxy_pass) and runtime-config.js (IDP_LOGIN_URI)
RUN apk add --no-cache gettext

EXPOSE 80

# Note: \${API_HOST} \${API_PORT} \${IDP_LOGIN_URI} must be escaped so the shell passes them literally to envsubst
CMD sh -c "envsubst '\${API_HOST} \${API_PORT}' < /etc/nginx/nginx.conf.template > /tmp/nginx.conf && \
  envsubst '\${IDP_LOGIN_URI}' < /usr/share/nginx/html/runtime-config.js.template > /usr/share/nginx/html/runtime-config.js && \
  exec nginx -g 'daemon off;' -c /tmp/nginx.conf"
