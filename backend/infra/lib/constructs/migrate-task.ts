import { Construct } from 'constructs';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as rds from 'aws-cdk-lib/aws-rds';

interface MigrateTaskProps {
  repositoryName: string;
  db: rds.DatabaseInstance;
}

export class MigrateTask extends Construct {
  public readonly taskDefinition: ecs.FargateTaskDefinition;

  constructor(scope: Construct, id: string, props: MigrateTaskProps) {
    super(scope, id);

    const repository = ecr.Repository.fromRepositoryName(
      this,
      'Repository',
      props.repositoryName
    );
    const image = ecs.ContainerImage.fromEcrRepository(repository)

    const taskRole = new iam.Role(this, 'TaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    });

    const executionRole = new iam.Role(this, 'ExecutionRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy'),
      ],
    });

    props.db.secret!.grantRead(executionRole);

    this.taskDefinition = new ecs.FargateTaskDefinition(this, 'MigrateTask', {
      cpu: 256,
      memoryLimitMiB: 512,
      taskRole,
      executionRole,
    });

    this.taskDefinition.addContainer('Migrate', {
      image: image,
      command: ['pnpm', 'drizzle-kit', 'migrate'],
      logging: ecs.LogDrivers.awsLogs({ streamPrefix: 'migrate' }),
      environment: {
        DB_HOST: props.db.dbInstanceEndpointAddress,
        DB_PORT: '5432',
        DB_NAME: 'app',
      },
      secrets: {
        DB_PASSWORD: ecs.Secret.fromSecretsManager(
          props.db.secret!,
          'password'
        ),
        DB_USER: ecs.Secret.fromSecretsManager(
          props.db.secret!,
          'username'
        ),
      },
    });
  }
}


