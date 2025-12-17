import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import { MigrateTask } from '../constructs/migrate-task';

interface MigrateServiceStackProps extends StackProps {
  serviceId: string
  vpc: ec2.IVpc
  appSg: ec2.SecurityGroup
  cluster: ecs.ICluster
  repositoryName: string
  db: rds.DatabaseInstance
}

export class MigrateServiceStack extends Stack {
  public readonly service: ecs.FargateService

  constructor(scope: Construct, id: string, props: MigrateServiceStackProps) {
    super(scope, id, props)

    const migrateTask = new MigrateTask(this, 'AppTask', {
      repositoryName: props.repositoryName,
      db: props.db,
    })

    this.service = new ecs.FargateService(this, props.serviceId, {
      serviceName: props.serviceId,
      taskDefinition: migrateTask.taskDefinition,
      cluster: props.cluster,
      securityGroups: [props.appSg],
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      assignPublicIp: true,
      desiredCount: 0
    })
  }
}
