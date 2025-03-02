#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CanaryImageStack } from '../lib/image-stack';
import { CanaryPipelineStack } from '../lib/pipeline-stack';

const app = new cdk.App();

// Create the image stack
const imageStack = new CanaryImageStack(app, 'CanaryImageStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1'
  }
});

// Create the pipeline stack
const pipelineStack = new CanaryPipelineStack(app, 'CanaryPipelineStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1'
  }
});

// Add dependency - pipeline stack depends on image stack
pipelineStack.addDependency(imageStack);

app.synth();