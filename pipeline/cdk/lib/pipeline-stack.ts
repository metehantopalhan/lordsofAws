import * as cdk from 'aws-cdk-lib';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { CanaryContainerImageStack } from './image-stack';
import { Construct } from 'constructs';

interface CanaryPipelineStackProps extends cdk.StackProps {
  imageStack: CanaryContainerImageStack;
}

export class CanaryPipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: CanaryPipelineStackProps) {
    super(scope, id, props);

    // Create VPC
    const vpc = new ec2.Vpc(this, 'CanaryVPC', {
      maxAzs: 2
    });

    // Create ECS Cluster
    const cluster = new ecs.Cluster(this, 'CanaryCluster', {
      vpc: vpc
    });

    // Create Fargate Task Definition
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'CanaryTaskDef', {
      memoryLimitMiB: 512,
      cpu: 256,
    });

    // Create Production Service
    const productionService = new ecs.FargateService(this, 'ProductionService', {
      cluster,
      taskDefinition,
      desiredCount: 3,
      deploymentController: {
        type: ecs.DeploymentControllerType.ECS
      }
    });

    // Create Canary Service
    const canaryService = new ecs.FargateService(this, 'CanaryService', {
      cluster,
      taskDefinition,
      desiredCount: 1,
      deploymentController: {
        type: ecs.DeploymentControllerType.ECS
      }
    });

    // Create Pipeline
    const pipeline = new codepipeline.Pipeline(this, 'CanaryPipeline');

    // Source Stage
    const sourceOutput = new codepipeline.Artifact();
    const sourceAction = new codepipeline_actions.CodeCommitSourceAction({
      actionName: 'CodeCommit',
      repository: props.imageStack.codeRepository,
      output: sourceOutput,
      branch: 'main'
    });

    // Build Stage
    const buildOutput = new codepipeline.Artifact();
    const buildProject = new codebuild.PipelineProject(this, 'BuildProject', {
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          build: {
            commands: [
              'docker build -t $ECR_REPO:$CODEBUILD_RESOLVED_SOURCE_VERSION .',
              'docker push $ECR_REPO:$CODEBUILD_RESOLVED_SOURCE_VERSION'
            ]
          }
        }
      }),
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_5_0,
        privileged: true
      }
    });

    const buildAction = new codepipeline_actions.CodeBuildAction({
      actionName: 'BuildImage',
      project: buildProject,
      input: sourceOutput,
      outputs: [buildOutput]
    });

    // Deploy to Canary
    const deployToCanary = new codepipeline_actions.EcsDeployAction({
      actionName: 'DeployToCanary',
      service: canaryService,
      imageFile: buildOutput.atPath('imagedefinitions.json')
    });

    // Manual Approval
    const manualApproval = new codepipeline_actions.ManualApprovalAction({
      actionName: 'ApproveDeployment'
    });

    // Deploy to Production
    const deployToProduction = new codepipeline_actions.EcsDeployAction({
      actionName: 'DeployToProduction',
      service: productionService,
      imageFile: buildOutput.atPath('imagedefinitions.json')
    });

    // Add stages to pipeline
    pipeline.addStage({
      stageName: 'Source',
      actions: [sourceAction]
    });

    pipeline.addStage({
      stageName: 'Build',
      actions: [buildAction]
    });

    pipeline.addStage({
      stageName: 'DeployToCanary',
      actions: [deployToCanary]
    });

    pipeline.addStage({
      stageName: 'Approval',
      actions: [manualApproval]
    });

    pipeline.addStage({
      stageName: 'DeployToProduction',
      actions: [deployToProduction]
    });
  }
}