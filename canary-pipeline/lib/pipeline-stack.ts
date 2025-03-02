import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import { Construct } from 'constructs';

export interface CanaryPipelineStackProps extends cdk.StackProps {
  readonly ecrRepository: ecr.Repository;
  readonly codeRepository: codecommit.Repository;
}

export class CanaryPipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: CanaryPipelineStackProps) {
    super(scope, id, props);

    // Create VPC
    const vpc = new ec2.Vpc(this, 'CanaryVPC', {
      maxAzs: 2,
      natGateways: 1
    });

    // Create ECS Cluster
    const cluster = new ecs.Cluster(this, 'CanaryCluster', {
      vpc,
      containerInsights: true
    });

    // Create Task Definition
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'CanaryTaskDef', {
      memoryLimitMiB: 512,
      cpu: 256
    });

    // Add container to task definition
    taskDefinition.addContainer('CanaryContainer', {
      image: ecs.ContainerImage.fromEcrRepository(props.ecrRepository),
      logging: new ecs.AwsLogDriver({ streamPrefix: 'canary-app' })
    });

    // Create Canary Service
    const canaryService = new ecs.FargateService(this, 'CanaryService', {
      cluster,
      taskDefinition,
      desiredCount: 1,
      assignPublicIp: false
    });

    // Create Production Service
    const productionService = new ecs.FargateService(this, 'ProductionService', {
      cluster,
      taskDefinition,
      desiredCount: 3,
      assignPublicIp: false
    });

    // Create Pipeline
    const pipeline = new codepipeline.Pipeline(this, 'CanaryPipeline', {
      pipelineName: 'canary-deployment-pipeline'
    });

    // Source Stage
    const sourceOutput = new codepipeline.Artifact();
    const sourceAction = new codepipeline_actions.CodeCommitSourceAction({
      actionName: 'CodeCommit',
      repository: props.codeRepository,
      output: sourceOutput,
      branch: 'main'
    });

    pipeline.addStage({
      stageName: 'Source',
      actions: [sourceAction]
    });

    // Build Stage
    const buildOutput = new codepipeline.Artifact();
    const buildProject = new codebuild.PipelineProject(this, 'BuildProject', {
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_5_0,
        privileged: true
      },
      environmentVariables: {
        REPOSITORY_URI: {
          value: props.ecrRepository.repositoryUri
        }
      }
    });

    const buildAction = new codepipeline_actions.CodeBuildAction({
      actionName: 'BuildImage',
      project: buildProject,
      input: sourceOutput,
      outputs: [buildOutput]
    });

    pipeline.addStage({
      stageName: 'Build',
      actions: [buildAction]
    });

    // Canary Deployment Stage
    const canaryDeployAction = new codepipeline_actions.EcsDeployAction({
      actionName: 'DeployCanary',
      service: canaryService,
      imageFile: buildOutput.atPath('imagedefinitions.json')
    });

    pipeline.addStage({
      stageName: 'Canary',
      actions: [canaryDeployAction]
    });

    // Manual Approval Stage
    const approvalAction = new codepipeline_actions.ManualApprovalAction({
      actionName: 'ApproveDeployment'
    });

    pipeline.addStage({
      stageName: 'Approval',
      actions: [approvalAction]
    });

    // Production Deployment Stage
    const productionDeployAction = new codepipeline_actions.EcsDeployAction({
      actionName: 'DeployProduction',
      service: productionService,
      imageFile: buildOutput.atPath('imagedefinitions.json')
    });

    pipeline.addStage({
      stageName: 'Production',
      actions: [productionDeployAction]
    });
  }
}