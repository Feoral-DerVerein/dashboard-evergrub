#!/bin/bash

# Configuration
PROJECT_ID=$(gcloud config get-value project)
REGION="europe-west1" # Change to your preferred region (e.g., us-central1)
JOB_NAME="forecasting-batch"
IMAGE_NAME="gcr.io/$PROJECT_ID/$JOB_NAME"

echo "🚀 Deploying Forecasting Worker to Cloud Run Jobs..."
echo "Project: $PROJECT_ID"
echo "Region: $REGION"

# 1. Build Container Image
echo "🔨 Building Docker Image..."
gcloud builds submit --tag $IMAGE_NAME .

# 2. Create or Update Job
echo "☁️ Creating/Updating Cloud Run Job..."
gcloud run jobs create $JOB_NAME \
    --image $IMAGE_NAME \
    --region $REGION \
    --tasks 1 \
    --memory 2Gi \
    --cpu 1 \
    --max-retries 1 \
    --service-account "firebase-adminsdk-xxxxx@$PROJECT_ID.iam.gserviceaccount.com" \ # TODO: Replace with your actual SA email

# 3. Create Scheduler (Run every night at 3 AM)
# echo "⏰ Creating Cloud Scheduler Trigger..."
# gcloud scheduler jobs create http forecasting-trigger \
#    --location $REGION \
#    --schedule "0 3 * * *" \
#    --uri "https://$REGION-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/$PROJECT_ID/jobs/$JOB_NAME:run" \
#    --http-method POST \
#    --oauth-service-account-email "start-job-sa@$PROJECT_ID.iam.gserviceaccount.com"

echo "✅ Job Deployed! Run it manually with:"
echo "gcloud run jobs execute $JOB_NAME --region $REGION"
