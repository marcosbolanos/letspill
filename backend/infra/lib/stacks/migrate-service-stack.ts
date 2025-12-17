import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import { MigrateTask } from '../constructs/migrate-task';

interface MigrateServiceStackProps extends StackProps {
  taskId: string
  vpc: ec2.IVpc
  appSg: ec2.SecurityGroup
  cluster: ecs.ICluster
  repositoryName: string
  db: rds.DatabaseInstance
}

export class MigrateServiceStack extends Stack {
  public readonly taskDefinition: ecs.FargateTaskDefinition

  constructor(scope: Construct, id: string, props: MigrateServiceStackProps) {
    super(scope, id, props)

    const migrateTask = new MigrateTask(this, props.taskId, {
      repositoryName: props.repositoryName,
      db: props.db
    })

    this.taskDefinition = migrateTask.taskDefinition
  }
}
