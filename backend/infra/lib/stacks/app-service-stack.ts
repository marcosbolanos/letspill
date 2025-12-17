import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
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
      assignPublicIp: true
    })
  }
}
