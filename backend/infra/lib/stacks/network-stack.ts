import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';

interface Props extends StackProps {
  appSgId: string,
  dbSgId: string,
  vpcName: string,
  clusterName: string
}

export class NetworkStack extends Stack {
  public readonly appSg: ec2.SecurityGroup;
  public readonly dbSg: ec2.SecurityGroup;
  public readonly vpc: ec2.IVpc;
  public readonly cluster: ecs.ICluster;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props);

    this.vpc = ec2.Vpc.fromLookup(this, 'Vpc', {
      tags: { Name: props.vpcName }
    });

    this.cluster = ecs.Cluster.fromClusterAttributes(this, 'Cluster', {
      clusterName: props.clusterName,
      vpc: this.vpc,
    })

    this.appSg = new ec2.SecurityGroup(this, props.appSgId, {
      vpc: this.vpc,
      allowAllOutbound: true,
    });

    this.dbSg = new ec2.SecurityGroup(this, props.dbSgId, {
      vpc: this.vpc,
    });

    this.dbSg.addIngressRule(this.appSg, ec2.Port.tcp(5432));
  }
}

