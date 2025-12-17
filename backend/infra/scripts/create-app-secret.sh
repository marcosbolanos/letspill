#!/bin/bash

# Generate a random secret for BETTER_AUTH_SECRET
RANDOM_SECRET=$(openssl rand -base64 32)

echo "Generated BETTER_AUTH_SECRET: $RANDOM_SECRET"
echo ""
echo "Please enter your Google OAuth credentials:"
read -p "GOOGLE_CLIENT_ID: " GOOGLE_CLIENT_ID
read -p "GOOGLE_CLIENT_SECRET: " GOOGLE_CLIENT_SECRET

# Create the secret
aws secretsmanager create-secret \
  --name DevLetspillAppSecrets \
  --description "Application secrets for Letspill Dev" \
  --secret-string "{\"BETTER_AUTH_SECRET\":\"$RANDOM_SECRET\",\"GOOGLE_CLIENT_ID\":\"$GOOGLE_CLIENT_ID\",\"GOOGLE_CLIENT_SECRET\":\"$GOOGLE_CLIENT_SECRET\"}" \
  --region eu-west-3

echo ""
echo "Secret created successfully!"
echo "ARN will be printed above. Add it to your .env file or CDK context."
