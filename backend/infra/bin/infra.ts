#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import 'dotenv/config'

import nodeEnv from '../lib/shared/env';
import { NetworkStack } from '../lib/stacks/network-stack'
import { AppServiceStack } from '../lib/stacks/app-service-stack';
import { RdbDbStack } from '../lib/stacks/rds-stack';
import { EcrStack } from '../lib/stacks/ecr-stack';

const prefixes = {
  development: 'Dev',
  production: 'Prod'
}
const appName = 'Letspill'
const prefix = `${prefixes[nodeEnv]}`; // Dev or Prod
const appPrefix = `${prefix}${appName}` // DevLetspill, ProdLetspill
const ecrRepositoryName = appName.toLowerCase() + '-' + prefix.toLowerCase() // letspill-dev

const app = new cdk.App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION
};

// Currently, dev and prod VPCs are shared across projects, allowing to later share ALBs/NAT gateways
// This is also the case for the dev and prod clusters.
// However, separate SGs are given to apps/DBs of each project
// This means that there's still some network-level isolation
const networkStack = new NetworkStack(app, "NetworkStack", {
  env,
  appSgId: `${appPrefix}AppSg`,
  dbSgId: `${appPrefix}DbSg`,
  vpcName: `Common${prefix}Vpc`, // CommonDevVpc, CommonProdVpc
  clusterName: `Common${prefix}Cluster`, // CommonDevCluster, CommonProdCluster
})

const vpc = networkStack.vpc
const cluster = networkStack.cluster
const appSg = networkStack.appSg
const dbSg = networkStack.dbSg

const rdbDbStack = new RdbDbStack(app, 'Db', {
  env,
  dbId: `${appPrefix}Db`,
  vpc: vpc,
  dbSg: dbSg
})
const db = rdbDbStack.db

const ecrStack = new EcrStack(app, 'EcrStack', {
  env,
  repositoryName: ecrRepositoryName
})

// For Prod, import the shared ALB from common infra
// For Dev, just use the ECS service directly (no ALB)
const isProd = nodeEnv === 'production';

const appServiceStack = new AppServiceStack(app, "AppServiceStack", {
  env,
  serviceId: `${appPrefix}AppService`,
  vpc,
  appSg,
  cluster,
  repositoryName: ecrRepositoryName,
  db,
  appSecretName: `${prefix}LetspillAppSecrets`,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  betterAuthUrl: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  // For Prod: import shared ALB from common infra using CloudFormation exports
  ...(isProd && {
    albListenerArn: cdk.Fn.importValue('CommonProdAlb-ListenerArn'),
    albSecurityGroupId: cdk.Fn.importValue('CommonProdAlb-SecurityGroupId'),
    pathPattern: '/*',
    listenerPriority: 100,
  }),
});
