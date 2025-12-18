import {
  Stack,
  StackProps,
  aws_apprunner as apprunner,
  aws_ecr as ecr,
  aws_iam as iam,
  aws_rds as rds,
  aws_secretsmanager as secretsmanager,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

interface AppRunnerStackProps extends StackProps {
  repositoryName: string;
  frontendUrl: string;
  betterAuthUrl: string;
  db: rds.DatabaseInstance;
  appSecretName: string;
}

export class AppRunnerStack extends Stack {
  constructor(scope: Construct, id: string, props: AppRunnerStackProps) {
    super(scope, id, props);

    const ecrRepository = ecr.Repository.fromRepositoryName(
      this,
      'Repository',
      props.repositoryName
    );

    const appSecret = secretsmanager.Secret.fromSecretNameV2(
      this,
      'AppSecret',
      props.appSecretName,
    );

    // Access role for pulling images from ECR (used during build/deploy)
    const accessRole = new iam.Role(this, 'AppRunnerAccessRole', {
      assumedBy: new iam.ServicePrincipal('build.apprunner.amazonaws.com'),
    });
    ecrRepository.grantPull(accessRole);

    // Instance role for runtime access to secrets
    const instanceRole = new iam.Role(this, 'AppRunnerInstanceRole', {
      assumedBy: new iam.ServicePrincipal('tasks.apprunner.amazonaws.com'),
    });
    appSecret.grantRead(instanceRole);
    props.db.secret!.grantRead(instanceRole);

    const service = new apprunner.CfnService(this, 'AppRunnerService', {
      sourceConfiguration: {
        authenticationConfiguration: {
          accessRoleArn: accessRole.roleArn,
        },
        autoDeploymentsEnabled: true,
        imageRepository: {
          imageIdentifier: ecrRepository.repositoryUriForTag('latest'),
          imageRepositoryType: 'ECR',
          imageConfiguration: {
            port: '3000',
            runtimeEnvironmentVariables: [
              {
                name: 'NODE_ENV',
                value: 'production',
              },
              {
                name: 'APP_SECRET_NAME',
                value: props.appSecretName,
              },
              {
                name: 'DB_SECRET_NAME',
                value: props.db.secret!.secretName,
              },
              {
                name: 'AWS_REGION',
                value: this.region,
              },
              {
                name: 'FRONTEND_URL',
                value: props.frontendUrl,
              },
              {
                name: 'BETTER_AUTH_URL',
                value: props.betterAuthUrl,
              },
            ] as apprunner.CfnService.KeyValuePairProperty[],
            runtimeEnvironmentSecrets: [
              {
                name: 'GOOGLE_CLIENT_ID',
                value: `${appSecret.secretArn}:GOOGLE_CLIENT_ID::`,
              },
              {
                name: 'GOOGLE_CLIENT_SECRET',
                value: `${appSecret.secretArn}:GOOGLE_CLIENT_SECRET::`,
              },
            ],
          },
        },
      },
      networkConfiguration: {
        egressConfiguration: {
          egressType: 'DEFAULT',
        },
      },
      instanceConfiguration: {
        cpu: '256',
        memory: '512',
        instanceRoleArn: instanceRole.roleArn,
      },
    });
  }
}
