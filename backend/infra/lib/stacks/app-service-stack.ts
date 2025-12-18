import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { AppTask } from '../constructs/app-task';

interface AppServiceStackProps extends StackProps {
  serviceId: string
  vpc: ec2.IVpc
  appSg: ec2.SecurityGroup
  cluster: ecs.ICluster
  repositoryName: string
  db: rds.DatabaseInstance
  appSecretName: string
  frontendUrl: string
  betterAuthUrl: string
  // Optional: provide ALB ARNs to register with shared ALB (for cross-stack imports)
  albListenerArn?: string
  albSecurityGroupId?: string
  // Path pattern for routing (e.g., '/api/*' or '/*')
  pathPattern?: string
  // Priority for listener rule (must be unique per listener)
  listenerPriority?: number
}

export class AppServiceStack extends Stack {
  public readonly service: ecs.FargateService

  constructor(scope: Construct, id: string, props: AppServiceStackProps) {
    super(scope, id, props)

    const appTask = new AppTask(this, 'AppTask', {
      repositoryName: props.repositoryName,
      db: props.db,
      appSecretName: props.appSecretName,
      frontendUrl: props.frontendUrl,
      betterAuthUrl: props.betterAuthUrl,
    })

    this.service = new ecs.FargateService(this, props.serviceId, {
      serviceName: props.serviceId,
      taskDefinition: appTask.taskDefinition,
      cluster: props.cluster,
      securityGroups: [props.appSg],
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      assignPublicIp: true,
      minHealthyPercent: 100,
      healthCheckGracePeriod: cdk.Duration.seconds(300),
    })

    // If ALB ARNs are provided, import and register the service with the shared ALB
    if (props.albListenerArn && props.albSecurityGroupId) {
      // Import ALB security group
      const albSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(
        this,
        'ImportedAlbSg',
        props.albSecurityGroupId
      );

      // Import ALB listener
      const albListener = elbv2.ApplicationListener.fromApplicationListenerAttributes(
        this,
        'ImportedListener',
        {
          listenerArn: props.albListenerArn,
          securityGroup: albSecurityGroup,
        }
      );

      // Allow ALB to connect to ECS tasks
      props.appSg.addIngressRule(
        albSecurityGroup,
        ec2.Port.tcp(3000),
        'Allow ALB to connect to ECS tasks'
      );

      // Allow ALB to make outbound connections to ECS tasks
      albSecurityGroup.addEgressRule(
        props.appSg,
        ec2.Port.tcp(3000),
        'Allow ALB to connect to ECS tasks on port 3000'
      );


      // Create target group for this service
      const targetGroup = new elbv2.ApplicationTargetGroup(this, 'TargetGroup', {
        vpc: props.vpc,
        port: 3000,
        protocol: elbv2.ApplicationProtocol.HTTP,
        targets: [this.service],
        healthCheck: {
          path: '/',
          healthyHttpCodes: '200-399',
          interval: require('aws-cdk-lib').Duration.seconds(30),
          timeout: require('aws-cdk-lib').Duration.seconds(15)
        },
      });

      // Add listener rule to route traffic to this service
      new elbv2.ApplicationListenerRule(this, 'ListenerRule', {
        listener: albListener,
        priority: props.listenerPriority || 100,
        conditions: [
          elbv2.ListenerCondition.pathPatterns([props.pathPattern || '/*']),
        ],
        targetGroups: [targetGroup],
      });
    }

    // Output service info
    new CfnOutput(this, 'ServiceName', {
      value: this.service.serviceName,
      description: 'ECS Service Name',
    });
  }
}
