import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

interface Props extends StackProps {
  dbId: string;
  vpc: ec2.IVpc;
  dbSg: ec2.SecurityGroup;
}

export class RdbDbStack extends Stack {
  public readonly db: rds.DatabaseInstance

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props)

    const pgParams = new rds.ParameterGroup(this, 'PostgresParams', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_17_7,
      }),
      parameters: {
        'rds.force_ssl': '0',
      },
    });

    this.db = new rds.DatabaseInstance(this, props.dbId, {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_17_7,
      }),
      instanceIdentifier: props.dbId,
      vpc: props.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      securityGroups: [props.dbSg],
      allocatedStorage: 20,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T4G,
        ec2.InstanceSize.MICRO
      ),
      credentials: rds.Credentials.fromGeneratedSecret('postgres'),
      databaseName: 'app',
      parameterGroup: pgParams,
      publiclyAccessible: false,
    });
  }
}




