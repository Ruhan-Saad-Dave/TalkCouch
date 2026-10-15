#!/bin/bash
# Build the backend Docker image and push it to AWS ECR.
# Usage: ./deploy/ecr-push.sh [region] [account-id] [tag]
# Example: ./deploy/ecr-push.sh us-east-1 123456789012 latest
set -euo pipefail

REGION=${1:-us-east-1}
ACCOUNT_ID=${2:-$(aws sts get-caller-identity --query Account --output text)}
IMAGE_TAG=${3:-latest}
REPO_NAME="talkcouch-backend"

ECR_URI="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"
FULL_IMAGE="$ECR_URI/$REPO_NAME:$IMAGE_TAG"

echo "==> Logging into ECR ($ECR_URI)..."
aws ecr get-login-password --region "$REGION" \
  | docker login --username AWS --password-stdin "$ECR_URI"

echo "==> Building backend image..."
docker build --platform linux/amd64 -t "$REPO_NAME:$IMAGE_TAG" ./backend

echo "==> Tagging as $FULL_IMAGE..."
docker tag "$REPO_NAME:$IMAGE_TAG" "$FULL_IMAGE"

echo "==> Pushing to ECR..."
docker push "$FULL_IMAGE"

echo ""
echo "Done! Image available at:"
echo "  $FULL_IMAGE"
