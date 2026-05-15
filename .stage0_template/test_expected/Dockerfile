# Build stage (Node 24+; aligns with package.json engines and jsdom 29 / Cypress)
FROM node:24-alpine AS build

ENV NPM_CONFIG_UPDATE_NOTIFIER=false

RUN apk add --no-cache git

WORKDIR /app

# Copies package.json always; adds package-lock.json after the first local npm install/commit.
# Fresh template clones have no lockfile yet — npm install runs; once lock exists, npm ci is used.
COPY package*json ./

ARG VITE_IDP_LOGIN_URI=http://127.0.0.1:8080/
ENV VITE_IDP_LOGIN_URI=$VITE_IDP_LOGIN_URI

# Install spa_utils via git (not npm.pkg.github.com). For private repos, pass the same token
# Actions uses for the workflow so git can clone the library repo (public repo needs no token).
# npm ci when package-lock.json exists; else npm install (no lockfile yet). Without a lock,
# git dependencies on #main track the remote branch tip and can drift — generate and commit
# package-lock.json locally. Rewrite git@ to https so lockfiles with git+ssh URLs clone in CI.
ARG GITHUB_TOKEN=
# Cache mounts: avoid re-downloading registry tarballs and re-cloning git deps (spa_utils) on
# every layer rebuild; under multi-arch/QEMU that extra I/O and CPU is especially costly.
RUN --mount=type=cache,target=/root/.npm \
    if [ -n "$GITHUB_TOKEN" ]; then \
      git config --global url."https://x-access-token:${GITHUB_TOKEN}@github.com/".insteadOf "https://github.com/"; \
    fi && \
    git config --global url."https://github.com/".insteadOf "git@github.com:" && \
    if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY . .
# Vite dependency pre-bundle cache (default cacheDir); reuse across CI runs per architecture.
RUN --mount=type=cache,target=/app/node_modules/.vite \
    npm run build

RUN DATE=$(date "+%Y-%m-%d:%H:%M:%S") && echo "$DATE" > ./dist/patch.txt

# Deploy stage
FROM nginx:stable-alpine

LABEL org.opencontainers.image.source="https://github.com/agile-learning-institute/mentorhub_sample_spa"

ENV API_HOST=mentorhub_sample_api
ENV API_PORT=8387

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/nginx.conf.template

# envsubst for runtime nginx config (API_HOST/API_PORT in proxy_pass)
RUN apk add --no-cache gettext

EXPOSE 80

# Note: \${API_HOST} \${API_PORT} must be escaped so the shell passes them literally to envsubst
CMD sh -c "envsubst '\${API_HOST} \${API_PORT}' < /etc/nginx/nginx.conf.template > /tmp/nginx.conf && exec nginx -g 'daemon off;' -c /tmp/nginx.conf"