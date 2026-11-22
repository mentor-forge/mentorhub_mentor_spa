#!/usr/bin/env sh
set -eu

root=$(cd "$(dirname "$0")/.." && pwd)
cd "$root"

if [ -z "${GITHUB_TOKEN:-}" ]; then
  printf '%s\n' 'Set GITHUB_TOKEN with GitHub Packages read access before running npm run container.' >&2
  exit 1
fi

DOCKER_BUILDKIT=1 docker build --pull \
  --secret id=github_npm_token,env=GITHUB_TOKEN \
  -t "${MENTOR_SPA_IMAGE:-ghcr.io/mentor-forge/mentorhub_mentor_spa:latest}" .
