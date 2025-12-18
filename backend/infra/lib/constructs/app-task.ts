import { Construct } from 'constructs';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';

interface AppTaskProps {
  repositoryName: string;
  db: rds.DatabaseInstance;
  appSecretName: string;
  frontendUrl: string;
  betterAuthUrl: string;
}

export class AppTask extends Construct {
  public readonly taskDefinition: ecs.FargateTaskDefinition;
  public readonly containerImage: ecs.ContainerImage

  constructor(scope: Construct, id: string, props: AppTaskProps) {
    super(scope, id);

    const taskRole = new iam.Role(this, 'TaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    });

    const executionRole = new iam.Role(this, 'ExecutionRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy'),
      ],
    });

    const repository = ecr.Repository.fromRepositoryName(
      this,
      'Repository',
      props.repositoryName
    );
    const containerImage = ecs.ContainerImage.fromEcrRepository(repository)

    props.db.secret!.grantRead(executionRole);

    const appSecret = secretsmanager.Secret.fromSecretNameV2(
      this,
      'AppSecret',
      props.appSecretName
    );
    appSecret.grantRead(executionRole);

    this.taskDefinition = new ecs.FargateTaskDefinition(this, 'AppTask', {
      cpu: 256,
      memoryLimitMiB: 512,
      taskRole,
      executionRole,
    });

    this.taskDefinition.addContainer('App', {
      image: containerImage,
      logging: ecs.LogDrivers.awsLogs({ streamPrefix: 'app' }),
      portMappings: [{ containerPort: 3000 }],
      environment: {
        NODE_ENV: 'production',
        PORT: '3000',
        DB_HOST: props.db.dbInstanceEndpointAddress,
        DB_PORT: '5432',
        DB_NAME: 'app',
        FRONTEND_URL: props.frontendUrl,
        BETTER_AUTH_URL: props.betterAuthUrl,
      },
      secrets: {
        DB_PASSWORD: ecs.Secret.fromSecretsManager(props.db.secret!, 'password'),
        DB_USER: ecs.Secret.fromSecretsManager(props.db.secret!, 'username'),
        BETTER_AUTH_SECRET: ecs.Secret.fromSecretsManager(appSecret, 'BETTER_AUTH_SECRET'),
        GOOGLE_CLIENT_ID: ecs.Secret.fromSecretsManager(appSecret, 'GOOGLE_CLIENT_ID'),
        GOOGLE_CLIENT_SECRET: ecs.Secret.fromSecretsManager(appSecret, 'GOOGLE_CLIENT_SECRET'),
      },
    });
  }
}
