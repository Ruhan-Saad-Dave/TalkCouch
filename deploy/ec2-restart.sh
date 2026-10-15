#!/bin/bash
# Pull the latest image from ECR and restart the backend container on EC2.
# Run this on the EC2 instance after pushing a new image.
# Usage: ssh ec2-user@<ec2-ip> 'bash -s' < ./deploy/ec2-restart.sh
set -euo pipefail

REGION="us-east-1"
ACCOUNT_ID="123456789012"
REPO_NAME="talkcouch-backend"
IMAGE_TAG="latest"

ECR_URI="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"
FULL_IMAGE="$ECR_URI/$REPO_NAME:$IMAGE_TAG"

echo "==> Authenticating to ECR..."
aws ecr get-login-password --region "$REGION" \
  | docker login --username AWS --password-stdin "$ECR_URI"

echo "==> Pulling latest image..."
docker pull "$FULL_IMAGE"

echo "==> Restarting container..."
docker stop talkcouch-backend 2>/dev/null || true
docker rm talkcouch-backend 2>/dev/null || true

docker run -d \
  --name talkcouch-backend \
  --restart unless-stopped \
  -p 8000:8000 \
  --env-file /home/ec2-user/backend.env \
  "$FULL_IMAGE"

# Remove dangling images to free disk space
docker image prune -f

echo "==> Done! Backend is running."
docker ps --filter name=talkcouch-backend
