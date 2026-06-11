#!/usr/bin/env sh
# Local Docker build with CodeArtifact npm auth (run `mh` first, or set AWS SSO profile).
set -e

root=$(cd "$(dirname "$0")/.." && pwd)
cd "$root"

domain="${CODEARTIFACT_DOMAIN:-mentor-forge}"
owner="${AWS_SHARED_SERVICES_ACCOUNT_ID:-560167829275}"
region="${AWS_REGION:-us-east-1}"

export AWS_PROFILE="${MH_AWS_PROFILE_SHARED:-mentorhub-shared}"

TOKEN=$(aws codeartifact get-authorization-token \
  --domain "${domain}" \
  --domain-owner "${owner}" \
  --region "${region}" \
  --query authorizationToken --output text)

export CODEARTIFACT_TOKEN="${TOKEN}"

DOCKER_BUILDKIT=1 docker build \
  --secret id=codeartifact_token,env=CODEARTIFACT_TOKEN \
  -t ghcr.io/mentor-forge/mentorhub_mentor_spa:latest .
