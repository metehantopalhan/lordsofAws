# AWS ECS Canary Deployment Pipeline

AWS CDK implementation of a canary deployment pipeline for ECS applications with automated testing and staged rollout.

## Project Structure

```
├── bin/
│   ├── app.ts
│   └── scripts/
│       └── deploy.sh
├── lib/
│   ├── image-stack.ts
│   └── pipeline-stack.ts
├── package.json
└── README.md
```

## Components

### Image Stack
- ECR Repository (`canary-app`)
  - Automatic image scanning enabled
  - Lifecycle cleanup policy
- CodeCommit Repository for application code
- IAM roles for build and deployment

### Pipeline Stack
- VPC Configuration
  - 2 Availability Zones
  - Public and Private subnets
- ECS Cluster Setup
  - Canary Service (1 task)
  - Production Service (3 tasks)
- Fargate Task Definition
  - Memory: 512MB
  - CPU: 256 units
- CodePipeline Configuration
  - Source Stage (CodeCommit)
  - Build Stage (CodeBuild)
  - Canary Deployment Stage
  - Manual Approval Gate
  - Production Deployment Stage

## Prerequisites

```bash
npm install -g aws-cdk@2.124.0
```

## Setup Instructions

1. Install project dependencies:
```bash
npm install
```

2. Build the TypeScript code:
```bash
npm run build
```

3. Deploy the infrastructure:
```bash
./bin/scripts/deploy.sh
```

## Deployment Process

1. Deploy the Image Stack:
```bash
cdk deploy CanaryImageStack
```

2. Deploy the Pipeline Stack:
```bash
cdk deploy CanaryPipelineStack
```

## Pipeline Workflow

1. **Source Stage**
   - Monitors CodeCommit repository
   - Triggers on main branch updates

2. **Build Stage**
   - Builds container image
   - Runs unit tests
   - Pushes to ECR

3. **Canary Deployment**
   - Deploys to single-task service
   - Runs integration tests
   - Monitors metrics

4. **Approval Gate**
   - Manual verification required
   - Review metrics and logs
   - Approve/Reject deployment

5. **Production Deployment**
   - Rolling update to production
   - Deploys to three-task service
   - Health check verification

## Cleanup

To remove all resources:
```bash
cdk destroy CanaryPipelineStack
cdk destroy CanaryImageStack
```

## Dependencies

```json
{
  "aws-cdk-lib": "2.124.0",
  "constructs": "^10.0.0",
  "typescript": "~5.2.2"
}
```