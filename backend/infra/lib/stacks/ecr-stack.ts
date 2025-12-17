import * as cdk from 'aws-cdk-lib';
import { Stack, StackProps } from 'aws-cdk-lib';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import { Construct } from 'constructs';

interface EcrStackProps extends StackProps {
  repositoryName: string
}

export class EcrStack extends Stack {
  public readonly repo: ecr.Repository;

  constructor(scope: Construct, id: string, props: EcrStackProps) {
    super(scope, id, props);

    this.repo = new ecr.Repository(this, 'AppRepo', {
      repositoryName: props.repositoryName,
      removalPolicy: cdk.RemovalPolicy.RETAIN, // keeps it after stack deletion
      imageScanOnPush: true,          // optional: security scanning
    });
  }
}

