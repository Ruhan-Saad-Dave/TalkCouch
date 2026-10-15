# AWS Deployment Guide

Architecture: **S3 + CloudFront** (frontend) + **ECR + EC2** (backend)

```
Users
  │
  ├──► CloudFront ──► S3 (React SPA static files)
  │
  └──► EC2 (Docker container pulled from ECR)
          └── FastAPI on port 8000
```

---

## Prerequisites

- AWS account with billing enabled
- AWS CLI installed and configured (`aws configure`)
- Docker installed and running
- Node.js 22+ (for local frontend builds)

---

## Step 1 — IAM Setup

### 1a. Create a deployment IAM user (for local scripts and GitHub Actions)

1. Go to **IAM → Users → Create user** → name it `talkcouch-deploy`
2. Attach these managed policies:
   - `AmazonEC2ContainerRegistryFullAccess`
   - `AmazonS3FullAccess`
   - `CloudFrontFullAccess`
3. Create an **Access Key** (type: CLI) and save the `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`

### 1b. Create an EC2 IAM Role (for the EC2 instance itself)

The EC2 instance needs to pull images from ECR without hardcoded credentials.

1. Go to **IAM → Roles → Create role**
2. Trusted entity: **EC2**
3. Attach policy: `AmazonEC2ContainerRegistryReadOnly`
4. Name it `ec2-talkcouch-role`
5. You will attach this role when launching the EC2 instance

---

## Step 2 — ECR (Elastic Container Registry)

Create a repository for the backend image.

```bash
aws ecr create-repository \
  --repository-name talkcouch-backend \
  --region us-east-1
```

Note the **repository URI** from the output — it looks like:
`123456789012.dkr.ecr.us-east-1.amazonaws.com/talkcouch-backend`

---

## Step 3 — Push the Backend Image

From your project root (requires Docker running):

```bash
# Replace with your actual region and account ID
./deploy/ecr-push.sh us-east-1 123456789012 latest
```

This script:
1. Authenticates Docker to ECR
2. Builds the backend image with `--platform linux/amd64` (required for EC2)
3. Tags and pushes to ECR

---

## Step 4 — Launch an EC2 Instance

### 4a. Choose settings

- **AMI**: Amazon Linux 2023 (free tier eligible)
- **Instance type**: `t3.micro` (free tier) or `t3.small` for better performance
- **Key pair**: Create one and download the `.pem` file — you need it for SSH
- **IAM instance profile**: Select `ec2-talkcouch-role` (created in Step 1b)

### 4b. Security Group (firewall)

Create a Security Group named `talkcouch-backend-sg` with these inbound rules:

| Type       | Port | Source      | Purpose           |
|------------|------|-------------|-------------------|
| SSH        | 22   | Your IP     | SSH access        |
| Custom TCP | 8000 | 0.0.0.0/0  | API (HTTP)        |

If you add HTTPS later, add port 443.

### 4c. User Data (optional — auto-setup on boot)

In the **Advanced → User data** field, paste the contents of [deploy/ec2-userdata.sh](deploy/ec2-userdata.sh) after editing the `REGION`, `ACCOUNT_ID` values at the top.

---

## Step 5 — Configure the Backend on EC2

SSH into the instance:

```bash
chmod 400 your-key.pem
ssh -i your-key.pem ec2-user@<ec2-public-ip>
```

Create the environment file:

```bash
cat <<EOF > ~/backend.env
GOOGLE_API_KEY=your_real_google_api_key
CORS_ORIGINS=https://yourdomain.com,https://d1234abcd.cloudfront.net
EOF
chmod 600 ~/backend.env
```

If you didn't use User Data, run this to start the backend manually:

```bash
# Authenticate to ECR
aws ecr get-login-password --region us-east-1 \
  | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com

# Pull and run
docker run -d \
  --name talkcouch-backend \
  --restart unless-stopped \
  -p 8000:8000 \
  --env-file ~/backend.env \
  123456789012.dkr.ecr.us-east-1.amazonaws.com/talkcouch-backend:latest
```

Verify it's running:

```bash
docker ps
curl http://localhost:8000/docs
```

---

## Step 6 — S3 Bucket for Frontend

### 6a. Create the bucket

```bash
aws s3 mb s3://talkcouch-frontend --region us-east-1
```

### 6b. Configure for static website hosting

```bash
aws s3 website s3://talkcouch-frontend \
  --index-document index.html \
  --error-document index.html
```

### 6c. Set bucket policy (public read)

```bash
aws s3api put-bucket-policy \
  --bucket talkcouch-frontend \
  --policy '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::talkcouch-frontend/*"
    }]
  }'
```

> **Note**: You will lock this down further once CloudFront is set up (allow only CloudFront OAC).

---

## Step 7 — CloudFront Distribution

1. Go to **CloudFront → Create distribution**
2. **Origin domain**: choose your S3 bucket from the dropdown (use the S3 REST endpoint, not the website endpoint)
3. **Origin access**: select **Origin access control (OAC)** → create a new OAC → copy the bucket policy it generates and apply it to your S3 bucket
4. **Default root object**: `index.html`
5. **Custom error responses**: add a rule for 403 → `/index.html` with response code 200 (needed for SPA routing)
6. Create the distribution — note the **Distribution domain name** (e.g. `d1234abcd.cloudfront.net`)

---

## Step 8 — Deploy the Frontend

```bash
# Replace with your actual values
./deploy/frontend-deploy.sh \
  talkcouch-frontend \
  http://<ec2-public-ip>:8000 \
  EDFDVBD6EXAMPLE
```

This builds the React app with the correct API URL baked in, syncs to S3, and invalidates CloudFront.

> **Important**: The `VITE_API_URL` is baked into the frontend at build time. If you change the EC2 IP, redeploy the frontend.

---

## Step 9 — GitHub Actions CI/CD (Automated Deploys)

Add these secrets to your GitHub repository (**Settings → Secrets → Actions**):

| Secret                 | Value                                           |
|------------------------|-------------------------------------------------|
| `AWS_ACCESS_KEY_ID`    | From Step 1a                                    |
| `AWS_SECRET_ACCESS_KEY`| From Step 1a                                    |
| `EC2_HOST`             | EC2 public IP or DNS                            |
| `EC2_SSH_KEY`          | Contents of your `.pem` file (the private key)  |
| `VITE_API_URL`         | `http://<ec2-ip>:8000` or your domain           |
| `S3_BUCKET`            | `talkcouch-frontend`                            |
| `CLOUDFRONT_DIST_ID`   | CloudFront distribution ID                      |

After setting secrets, every push to `main` will:
1. Build the backend image, push to ECR, and restart the container on EC2
2. Build the frontend and sync to S3, then invalidate CloudFront

The workflow file is at [.github/workflows/deploy.yml](.github/workflows/deploy.yml).

---

## Updating After Code Changes

### Manual update — backend only:
```bash
./deploy/ecr-push.sh us-east-1 123456789012 latest
ssh -i your-key.pem ec2-user@<ec2-ip> 'bash -s' < ./deploy/ec2-restart.sh
```

### Manual update — frontend only:
```bash
./deploy/frontend-deploy.sh talkcouch-frontend http://<ec2-ip>:8000 EDFDVBD6EXAMPLE
```

### Automatic: just push to `main` — GitHub Actions handles both.

---

## Optional: Custom Domain with HTTPS

1. Register a domain in **Route 53** (or point an existing domain's nameservers)
2. Request an SSL certificate in **ACM** (us-east-1 region for CloudFront) for `yourdomain.com` and `api.yourdomain.com`
3. In CloudFront: add your domain as an alternate name, attach the ACM certificate
4. For the backend API: add an **Application Load Balancer** (ALB) with HTTPS listener (ACM cert) pointing to the EC2 instance — this gives you `https://api.yourdomain.com`
5. Update `CORS_ORIGINS` in `~/backend.env` on EC2 to include `https://yourdomain.com`
6. Rebuild and redeploy the frontend with `VITE_API_URL=https://api.yourdomain.com`

---

## Cost Estimate (monthly, free tier excluded)

| Service       | Spec              | Est. Cost     |
|---------------|-------------------|---------------|
| EC2 t3.micro  | 730 hrs/month     | ~$8 or free*  |
| ECR           | <1 GB storage     | ~$0.10        |
| S3            | <1 GB storage     | ~$0.02        |
| CloudFront    | First 1TB free    | $0            |
| Data transfer | Light usage       | ~$1           |

*t3.micro is free for 12 months on a new AWS account.

---

## Quick Reference

```bash
# Check backend logs on EC2
ssh ec2-user@<ip> 'docker logs -f talkcouch-backend'

# Get EC2 public IP
aws ec2 describe-instances --query 'Reservations[*].Instances[*].PublicIpAddress' --output text

# List ECR images
aws ecr list-images --repository-name talkcouch-backend

# Check CloudFront invalidation status
aws cloudfront list-invalidations --distribution-id EDFDVBD6EXAMPLE
```
