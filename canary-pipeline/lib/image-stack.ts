import * as cdk from 'aws-cdk-lib';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class CanaryImageStack extends cdk.Stack {
  public readonly repository: ecr.Repository;
  public readonly codeRepository: codecommit.Repository;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create ECR Repository
    this.repository = new ecr.Repository(this, 'CanaryAppRepository', {
      repositoryName: 'canary-app',
      imageScanOnPush: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      lifecycleRules: [
        {
          maxImageCount: 10,
          description: 'Keep only 10 images'
        }
      ]
    });

    // Create CodeCommit Repository
    this.codeRepository = new codecommit.Repository(this, 'CanaryAppCode', {
      repositoryName: 'canary-app-code',
      description: 'Application code for Canary Deployment'
    });

    // Create IAM Role for CodeBuild
    const buildRole = new iam.Role(this, 'CodeBuildServiceRole', {
      assumedBy: new iam.ServicePrincipal('codebuild.amazonaws.com'),
      description: 'Role used by CodeBuild to build and push container images'
    });

    // Add permissions to the build role
    buildRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'ecr:GetAuthorizationToken',
        'ecr:BatchCheckLayerAvailability',
        'ecr:GetDownloadUrlForLayer',
        'ecr:GetRepositoryPolicy',
        'ecr:DescribeRepositories',
        'ecr:ListImages',
        'ecr:DescribeImages',
        'ecr:BatchGetImage',
        'ecr:InitiateLayerUpload',
        'ecr:UploadLayerPart',
        'ecr:CompleteLayerUpload',
        'ecr:PutImage'
      ],
      resources: [this.repository.repositoryArn]
    }));

    // Add CloudWatch Logs permissions
    buildRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'logs:CreateLogGroup',
        'logs:CreateLogStream',
        'logs:PutLogEvents'
      ],
      resources: ['*']
    }));

    // Output the repository ARN and URL
    new cdk.CfnOutput(this, 'RepositoryArn', {
      value: this.repository.repositoryArn,
      description: 'ECR Repository ARN'
    });

    new cdk.CfnOutput(this, 'RepositoryUri', {
      value: this.repository.repositoryUri,
      description: 'ECR Repository URI'
    });

    new cdk.CfnOutput(this, 'CodeRepositoryCloneUrlHttp', {
      value: this.codeRepository.repositoryCloneUrlHttp,
      description: 'CodeCommit Repository Clone URL (HTTPS)'
    });
  }
}