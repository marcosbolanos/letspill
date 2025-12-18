import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export interface VpcStackProps extends StackProps {
  vpcName: string
}

export class VpcStack extends Stack {
  public readonly vpc: ec2.Vpc;

  constructor(scope: Construct, id: string, props: VpcStackProps) {
    super(scope, id, props);

    this.vpc = new ec2.Vpc(this, 'Vpc', {
      vpcName: props.vpcName,
      maxAzs: 3,
      natGateways: 0,
      subnetConfiguration: [
        {
          name: 'public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          name: 'private',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });
  }
}

