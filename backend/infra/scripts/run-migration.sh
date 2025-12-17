#!/bin/bash
set -e

REGION="eu-west-3"
CLUSTER="CommonDevCluster"

echo "🔍 Finding migration task definition..."

# Get the task definition ARN from the MigrateServiceStack
TASK_DEF=$(aws cloudformation describe-stacks \
  --stack-name MigrateServiceStack \
  --region $REGION \
  --query 'Stacks[0].Outputs[?OutputKey==`TaskDefinitionArn`].OutputValue' \
  --output text 2>/dev/null)

# If no output, try to find it by listing task definitions
if [ -z "$TASK_DEF" ] || [ "$TASK_DEF" == "None" ]; then
  echo "📋 Looking up task definition..."
  TASK_DEF=$(aws ecs list-task-definitions \
    --region $REGION \
    --family-prefix MigrateServiceStack \
    --sort DESC \
    --max-items 1 \
    --query 'taskDefinitionArns[0]' \
    --output text)
fi

if [ -z "$TASK_DEF" ] || [ "$TASK_DEF" == "None" ]; then
  echo "❌ Migration task definition not found. Make sure MigrateServiceStack is deployed."
  exit 1
fi

echo "✅ Found task definition: $TASK_DEF"

# Get the app security group
APP_SG=$(aws ec2 describe-security-groups \
  --region $REGION \
  --filters "Name=group-name,Values=*DevLetspillAppSg*" \
  --query 'SecurityGroups[0].GroupId' \
  --output text)

# Get a private/isolated subnet (same as RDS)
SUBNET=$(aws ec2 describe-subnets \
  --region $REGION \
  --filters "Name=tag:Name,Values=*privateSubnet1" \
  --query 'Subnets[0].SubnetId' \
  --output text)

if [ -z "$SUBNET" ] || [ "$SUBNET" == "None" ]; then
  echo "⚠️  No private subnet found, using public subnet..."
  SUBNET=$(aws ec2 describe-subnets \
    --region $REGION \
    --filters "Name=tag:Name,Values=*publicSubnet1" \
    --query 'Subnets[0].SubnetId' \
    --output text)
  ASSIGN_PUBLIC_IP="ENABLED"
else
  ASSIGN_PUBLIC_IP="DISABLED"
fi

echo "🚀 Running migration task..."
echo "   Task Definition: $TASK_DEF"
echo "   Cluster: $CLUSTER"
echo "   Subnet: $SUBNET"
echo "   Security Group: $APP_SG"

TASK_ARN=$(aws ecs run-task \
  --cluster $CLUSTER \
  --task-definition $TASK_DEF \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[$SUBNET],securityGroups=[$APP_SG],assignPublicIp=$ASSIGN_PUBLIC_IP}" \
  --region $REGION \
  --query 'tasks[0].taskArn' \
  --output text)

if [ -z "$TASK_ARN" ]; then
  echo "❌ Failed to start migration task"
  exit 1
fi

echo "✅ Migration task started: $TASK_ARN"
echo "⏳ Waiting for task to complete..."

# Wait for task to complete (with timeout)
TIMEOUT=300  # 5 minutes
ELAPSED=0
while [ $ELAPSED -lt $TIMEOUT ]; do
  STATUS=$(aws ecs describe-tasks \
    --cluster $CLUSTER \
    --tasks $TASK_ARN \
    --region $REGION \
    --query 'tasks[0].lastStatus' \
    --output text)
  
  if [ "$STATUS" == "STOPPED" ]; then
    EXIT_CODE=$(aws ecs describe-tasks \
      --cluster $CLUSTER \
      --tasks $TASK_ARN \
      --region $REGION \
      --query 'tasks[0].containers[0].exitCode' \
      --output text)
    
    if [ "$EXIT_CODE" == "0" ]; then
      echo "✅ Migration completed successfully!"
      
      # Show logs
      echo ""
      echo "📋 Migration logs:"
      sleep 2  # Wait for logs to be available
      aws logs tail /aws/ecs/migrate --region $REGION --since 5m --format short 2>/dev/null || echo "Logs not yet available"
      exit 0
    else
      echo "❌ Migration failed with exit code: $EXIT_CODE"
      
      # Show logs
      echo ""
      echo "📋 Migration logs:"
      sleep 2
      aws logs tail /aws/ecs/migrate --region $REGION --since 5m --format short 2>/dev/null || echo "Logs not yet available"
      exit 1
    fi
  fi
  
  echo "   Status: $STATUS (${ELAPSED}s elapsed)"
  sleep 5
  ELAPSED=$((ELAPSED + 5))
done

echo "❌ Migration task timed out after ${TIMEOUT}s"
exit 1
