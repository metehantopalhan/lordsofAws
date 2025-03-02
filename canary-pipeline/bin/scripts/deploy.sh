#!/bin/bash

# Exit on error
set -e

# Build the TypeScript code
echo "Building TypeScript code..."
npm run build

# Deploy the image stack first
echo "Deploying CanaryImageStack..."
cdk deploy CanaryImageStack --require-approval never

# Deploy the pipeline stack
echo "Deploying CanaryPipelineStack..."
cdk deploy CanaryPipelineStack --require-approval never

echo "Deployment completed successfully!"