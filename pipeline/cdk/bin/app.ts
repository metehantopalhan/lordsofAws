import * as cdk from 'aws-cdk-lib';
import { CanaryContainerImageStack } from '../lib/image-stack';
import { CanaryPipelineStack } from '../lib/pipeline-stack';

const app = new cdk.App();

const imageStack = new CanaryContainerImageStack(app, 'CanaryContainerImageStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  }
});

new CanaryPipelineStack(app, 'CanaryPipelineStack', {
  imageStack: imageStack,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  }
});

app.synth();