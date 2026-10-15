#!/bin/bash
# EC2 User Data script — runs once on first boot when launching an EC2 instance.
# Paste this into the "User data" field when launching your EC2 instance.
# Replace REGION, ACCOUNT_ID, and IMAGE_TAG with your values before pasting.
set -euo pipefail

REGION="us-east-1"
ACCOUNT_ID="123456789012"
REPO_NAME="talkcouch-backend"
IMAGE_TAG="latest"

ECR_URI="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"
FULL_IMAGE="$ECR_URI/$REPO_NAME:$IMAGE_TAG"

# Install Docker
yum update -y
yum install -y docker
systemctl enable docker
systemctl start docker
usermod -aG docker ec2-user

# Install AWS CLI v2
yum install -y unzip
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o /tmp/awscliv2.zip
unzip -q /tmp/awscliv2.zip -d /tmp
/tmp/aws/install

# Authenticate to ECR (IAM role on the instance provides credentials)
aws ecr get-login-password --region "$REGION" \
  | docker login --username AWS --password-stdin "$ECR_URI"

# Pull the backend image
docker pull "$FULL_IMAGE"

# Create the env file — EDIT THIS before first run, or set via SSM Parameter Store
# Place your real values in /home/ec2-user/backend.env
cat <<'ENV' > /home/ec2-user/backend.env
GOOGLE_API_KEY=your_google_api_key_here
CORS_ORIGINS=https://yourdomain.com
ENV

# Run the backend container
docker run -d \
  --name talkcouch-backend \
  --restart unless-stopped \
  -p 8000:8000 \
  --env-file /home/ec2-user/backend.env \
  "$FULL_IMAGE"

echo "TalkCouch backend started."
