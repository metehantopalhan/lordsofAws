# AWS ECS Canary Deployment CDK

AWS CDK implementation of a canary deployment pipeline for ECS applications.

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
  - Automatic image scanning
  - Cleanup policy enabled
- CodeCommit Repository
- IAM roles for build process

### Pipeline Stack
- VPC with 2 AZs
- ECS Cluster with:
  - Production Service (3 tasks)
  - Canary Service (1 task)
- Fargate Task Definition (512MB memory, 256 CPU)
- CodePipeline with stages:
  - Source (CodeCommit)
  - Build (CodeBuild)
  - Canary Deployment
  - Manual Approval
  - Production Deployment

## Prerequisites

```bash
npm install -g aws-cdk@2.124.0
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build
```

3. Deploy:
```bash
./bin/scripts/deploy.sh
```

## Stack Configuration

### app.ts
- Deploys both image and pipeline stacks
- Uses environment-specific account and region

### image-stack.ts
- Creates container registry
- Sets up source code repository
- Configures build permissions

### pipeline-stack.ts
- Implements canary deployment strategy
- Configures deployment stages
- Manages ECS services

## Available Scripts

```json
{
  "build": "tsc",
  "watch": "tsc -w",
  "test": "jest",
  "cdk": "cdk"
}
```

## Deployment Process

1. Image Stack Deployment:
```bash
cdk deploy CanaryContainerImageStack
```

2. Pipeline Stack Deployment:
```bash
cdk deploy CanaryPipelineStack
```

Or use the automated script:
```bash
./bin/scripts/deploy.sh
```

## Pipeline Stages

1. **Source**
   - Monitors CodeCommit repository
   - Triggers on main branch changes

2. **Build**
   - Uses CodeBuild with Linux environment
   - Builds Docker image
   - Pushes to ECR

3. **Canary Deployment**
   - Deploys to single-task service
   - Tests new version

4. **Manual Approval**
   - Requires human verification
   - Go/No-go decision point

5. **Production Deployment**
   - Deploys to three-task service
   - Full production rollout

## Cleanup

To remove all resources:
```bash
cdk destroy CanaryPipelineStack
cdk destroy CanaryContainerImageStack
```

## Dependencies

```json
{
  "aws-cdk-lib": "2.124.0",
  "constructs": "^10.0.0"
}
```

## Development Dependencies

```json
{
  "@types/jest": "^29.5.5",
  "@types/node": "20.7.1",
  "jest": "^29.7.0",
  "ts-jest": "^29.1.1",
  "aws-cdk": "2.124.0",
  "ts-node": "^10.9.1",
  "typescript": "~5.2.2"
}
```
```