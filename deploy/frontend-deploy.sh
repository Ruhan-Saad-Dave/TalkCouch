#!/bin/bash
# Build the frontend and deploy it to an S3 bucket, then invalidate CloudFront.
# Usage: ./deploy/frontend-deploy.sh <s3-bucket> <api-url> [cloudfront-dist-id]
# Example: ./deploy/frontend-deploy.sh talkcouch-frontend https://api.yourdomain.com EDFDVBD6EXAMPLE
set -euo pipefail

BUCKET=${1:?"Usage: $0 <s3-bucket> <api-url> [cloudfront-dist-id]"}
VITE_API_URL=${2:?"Usage: $0 <s3-bucket> <api-url> [cloudfront-dist-id]"}
CF_DIST_ID=${3:-}

echo "==> Building frontend (VITE_API_URL=$VITE_API_URL)..."
cd "$(dirname "$0")/../frontend"
VITE_API_URL="$VITE_API_URL" npm run build

echo "==> Syncing dist/ to s3://$BUCKET..."
aws s3 sync dist/ "s3://$BUCKET" --delete

if [ -n "$CF_DIST_ID" ]; then
  echo "==> Invalidating CloudFront distribution $CF_DIST_ID..."
  aws cloudfront create-invalidation \
    --distribution-id "$CF_DIST_ID" \
    --paths "/*"
fi

echo ""
echo "Done! Frontend deployed to s3://$BUCKET"
[ -n "$CF_DIST_ID" ] && echo "CloudFront cache cleared — changes live in ~30 seconds."
