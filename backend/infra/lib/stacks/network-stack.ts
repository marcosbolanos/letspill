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

    // Allow inbound traffic on port 3000 from anywhere
    this.appSg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(3000), 'Allow HTTP on port 3000');

    this.dbSg = new ec2.SecurityGroup(this, props.dbSgId, {
      vpc: this.vpc,
    });

    this.dbSg.addIngressRule(this.appSg, ec2.Port.tcp(5432));

    // Add VPC endpoints for AWS services (required for private subnets without NAT)
    this.vpc.addInterfaceEndpoint('SecretsManagerEndpoint', {
      service: ec2.InterfaceVpcEndpointAwsService.SECRETS_MANAGER,
      securityGroups: [this.appSg],
    });

    this.vpc.addInterfaceEndpoint('EcrApiEndpoint', {
      service: ec2.InterfaceVpcEndpointAwsService.ECR,
      securityGroups: [this.appSg],
    });

    this.vpc.addInterfaceEndpoint('EcrDockerEndpoint', {
      service: ec2.InterfaceVpcEndpointAwsService.ECR_DOCKER,
      securityGroups: [this.appSg],
    });

    this.vpc.addInterfaceEndpoint('CloudWatchLogsEndpoint', {
      service: ec2.InterfaceVpcEndpointAwsService.CLOUDWATCH_LOGS,
      securityGroups: [this.appSg],
    });

    // S3 gateway endpoint for ECR image layers (no cost)
    this.vpc.addGatewayEndpoint('S3Endpoint', {
      service: ec2.GatewayVpcEndpointAwsService.S3,
    });
  }
}

