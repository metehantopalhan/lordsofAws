#!/bin/bash
set -e

# Install dependencies
npm install

# Build the project
npm run build

# Deploy the image stack
cdk deploy CanaryContainerImageStack --require-approval never

# Deploy the pipeline stack
cdk deploy CanaryPipelineStack --require-approval never