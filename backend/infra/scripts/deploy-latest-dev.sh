#!/bin/bash
set -e

REGION="eu-west-3"
CLUSTER="CommonDevCluster"
SERVICE_NAME=$(aws ecs list-services --cluster $CLUSTER --region $REGION --query 'serviceArns[?contains(@, `DevLetspill`)]' --output text | awk -F'/' '{print $3}')

echo "🚀 Forcing new deployment for service: $SERVICE_NAME"

aws ecs update-service \
  --cluster $CLUSTER \
  --service $SERVICE_NAME \
  --force-new-deployment \
  --region $REGION \
  --no-cli-pager

echo "✅ Deployment initiated. Tasks will be updated with the latest image."
echo "Monitor progress with: aws ecs describe-services --cluster $CLUSTER --service $SERVICE_NAME --region $REGION"
