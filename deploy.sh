#!/bin/bash
set -e

# Variables
BUCKET="aws-learning-s3-website-telephon4x-001"
DISTRIBUTION_ID="E2N00XX6UXFGP2"   # Make sure this matches your CloudFront distribution

echo "Starting deployment..."

# Sync all project files to S3, excluding unnecessary local files
aws s3 sync . s3://$BUCKET \
  --exclude ".git/*" \
  --exclude ".gitignore" \
  --exclude ".DS_Store" \
  --exclude "*.md" \
  --exclude "*.sh"

# Upload JSON data files explicitly
aws s3 cp data/ s3://$BUCKET/data/ --recursive --exclude "*" --include "*.json"

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*"

echo "Deployment complete."
