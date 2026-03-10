#!/bin/bash
# ============================================
# Tourya Front - GCP Infrastructure Setup
# Project: wass-project | Region: us-east1
# ============================================

PROJECT_ID="wass-project"
REGION="us-east1"
REPO_NAME="tourya-front"
SERVICE_NAME="tourya-front"

echo "=== 1. Setting project ==="
gcloud config set project $PROJECT_ID

echo "=== 2. Enabling required APIs ==="
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  artifactregistry.googleapis.com

echo "=== 3. Creating Artifact Registry repository ==="
gcloud artifacts repositories create $REPO_NAME \
  --repository-format=docker \
  --location=$REGION \
  --description="Tourya Front Docker images"

echo "=== 4. Granting Cloud Build permissions to deploy to Cloud Run ==="
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/run.admin"
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

echo "=== 5. First manual build & deploy (optional) ==="
echo "Run these commands to do an initial deploy:"
echo ""
echo "  # Build and push image"
echo "  gcloud builds submit --config=cloudbuild.yaml ."
echo ""
echo "  # Or build locally and push"
echo "  docker build -t us-east1-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/$SERVICE_NAME:latest ."
echo "  docker push us-east1-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/$SERVICE_NAME:latest"
echo "  gcloud run deploy $SERVICE_NAME \\"
echo "    --image us-east1-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/$SERVICE_NAME:latest \\"
echo "    --region $REGION --platform managed --port 8080 --allow-unauthenticated"

echo ""
echo "=== 6. Domain Mapping (after deploy) ==="
echo "To map a custom domain (e.g., tourya.co):"
echo ""
echo "  gcloud beta run domain-mappings create \\"
echo "    --service $SERVICE_NAME \\"
echo "    --domain tourya.co \\"
echo "    --region $REGION"
echo ""
echo "Then configure DNS in GoDaddy:"
echo "  - Type A     -> IP provided by gcloud domain-mappings describe"
echo "  - Type AAAA  -> IPv6 provided by gcloud domain-mappings describe"
echo "  - Type CNAME -> ghs.googlehosted.com (for www subdomain)"
echo ""

echo "=== 7. Setting up Cloud Build trigger (GitHub) ==="
echo "To auto-deploy on push to develop_ftmg:"
echo ""
echo "  gcloud beta builds triggers create github \\"
echo "    --repo-name=tourya-front \\"
echo "    --repo-owner=Touryapp \\"
echo "    --branch-pattern='^develop_ftmg$' \\"
echo "    --build-config=cloudbuild.yaml \\"
echo "    --name=tourya-front-deploy"
echo ""

echo "=== Setup complete ==="
