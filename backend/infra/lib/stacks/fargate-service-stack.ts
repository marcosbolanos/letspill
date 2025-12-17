import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import { AppTask } from '../constructs/app-task';

interface FargateServiceStackProps extends StackProps {
  serviceId: string
  vpc: ec2.IVpc
  appSg: ec2.SecurityGroup
  cluster: ecs.ICluster
  repositoryName: string
  db: rds.DatabaseInstance
}

export class FargateServiceStack extends Stack {
  public readonly service: ecs.FargateService

  constructor(scope: Construct, id: string, props: FargateServiceStackProps) {
    super(scope, id, props)

    const appTask = new AppTask(this, 'AppTask', {
      repositoryName: props.repositoryName,
      db: props.db
    })

    this.service = new ecs.FargateService(this, props.serviceId, {
      taskDefinition: appTask.taskDefinition,
      cluster: props.cluster,
      securityGroups: [props.appSg]
    })
  }
}
