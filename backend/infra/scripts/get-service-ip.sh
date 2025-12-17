#!/bin/bash

REGION="eu-west-3"
CLUSTER="CommonDevCluster"

echo "🔍 Finding task public IP..."

SERVICE_ARN=$(aws ecs list-services --cluster $CLUSTER --region $REGION --query 'serviceArns[?contains(@, `DevLetspill`)]' --output text)

if [ -z "$SERVICE_ARN" ]; then
    echo "❌ Service not found"
    exit 1
fi

TASK_ARN=$(aws ecs list-tasks --cluster $CLUSTER --service-name $SERVICE_ARN --region $REGION --query 'taskArns[0]' --output text)

if [ -z "$TASK_ARN" ] || [ "$TASK_ARN" == "None" ]; then
    echo "❌ No running tasks found"
    exit 1
fi

ENI_ID=$(aws ecs describe-tasks --cluster $CLUSTER --tasks $TASK_ARN --region $REGION --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' --output text)

PUBLIC_IP=$(aws ec2 describe-network-interfaces --network-interface-ids $ENI_ID --region $REGION --query 'NetworkInterfaces[0].Association.PublicIp' --output text)

if [ -z "$PUBLIC_IP" ] || [ "$PUBLIC_IP" == "None" ]; then
    echo "❌ No public IP found"
    exit 1
fi

echo "✅ Public IP: $PUBLIC_IP"
echo "🌐 Service URL: http://$PUBLIC_IP:3000"
