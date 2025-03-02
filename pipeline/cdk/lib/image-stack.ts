import * as cdk from 'aws-cdk-lib';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class CanaryContainerImageStack extends cdk.Stack {
  public readonly ecrRepository: ecr.Repository;
  public readonly codeRepository: codecommit.Repository;
  public readonly buildRole: iam.Role;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create ECR Repository
    this.ecrRepository = new ecr.Repository(this, 'EcsCanaryEcrRepo', {
      repositoryName: 'canary-app',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      imageScanOnPush: true
    });

    // Create CodeCommit Repository
    this.codeRepository = new codecommit.Repository(this, 'EcsCanaryCodeRepo', {
      repositoryName: 'canary-app',
      description: 'Application code for ECS Canary deployment'
    });

    // Create IAM Role for CodeBuild
    this.buildRole = new iam.Role(this, 'CodeBuildServiceRole', {
      assumedBy: new iam.ServicePrincipal('codebuild.amazonaws.com')
    });

    // Add permissions to the role
    this.buildRole.addToPolicy(new iam.PolicyStatement({
      actions: [
        'ecr:GetAuthorizationToken',
        'ecr:BatchCheckLayerAvailability',
        'ecr:PutImage',
        'ecr:InitiateLayerUpload',
        'ecr:UploadLayerPart',
        'ecr:CompleteLayerUpload'
      ],
      resources: [this.ecrRepository.repositoryArn]
    }));
  }
}