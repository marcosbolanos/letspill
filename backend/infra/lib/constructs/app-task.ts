import { Construct } from 'constructs';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as rds from 'aws-cdk-lib/aws-rds';

interface AppTaskProps {
  repositoryName: string;
  db: rds.DatabaseInstance;
}

export class AppTask extends Construct {
  public readonly taskDefinition: ecs.FargateTaskDefinition;
  public readonly containerImage: ecs.ContainerImage

  constructor(scope: Construct, id: string, props: AppTaskProps) {
    super(scope, id);

    const taskRole = new iam.Role(this, 'TaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    });

    const repository = ecr.Repository.fromRepositoryName(
      this,
      'Repository',
      props.repositoryName
    );
    const containerImage = ecs.ContainerImage.fromEcrRepository(repository)

    props.db.secret!.grantRead(taskRole);

    this.taskDefinition = new ecs.FargateTaskDefinition(this, 'AppTask', {
      cpu: 256,
      memoryLimitMiB: 512,
      taskRole,
    });

    this.taskDefinition.addContainer('App', {
      image: containerImage,
      logging: ecs.LogDrivers.awsLogs({ streamPrefix: 'app' }),
      environment: {
        DATABASE_HOST: props.db.dbInstanceEndpointAddress,
        DATABASE_PORT: '5432',
        DATABASE_NAME: 'app',
      },
      secrets: {
        DATABASE_PASSWORD: ecs.Secret.fromSecretsManager(
          props.db.secret!,
          'password'
        ),
      },
    });
  }
}

