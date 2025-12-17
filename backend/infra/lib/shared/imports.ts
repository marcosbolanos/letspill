import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';

interface AppImportProps {
  vpcName: string
  clusterName: string
  imageName: string
}

export class AppImports {
  public readonly vpc: ec2.IVpc;
  public readonly cluster: ecs.ICluster;
  public readonly image: ecs.ContainerImage

  constructor(scope: Construct, props: AppImportProps) {
    this.vpc = ec2.Vpc.fromLookup(scope, 'Vpc', {
      tags: { Name: props.vpcName }
    });

    this.cluster = ecs.Cluster.fromClusterAttributes(scope, 'Cluster', {
      clusterName: props.clusterName,
      vpc: this.vpc,
    })

    this.image = ecs.ContainerImage.fromRegistry(props.imageName)
  }
}


