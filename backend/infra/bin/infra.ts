#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import 'dotenv/config'

import nodeEnv from '../lib/shared/env';
import { NetworkStack } from '../lib/stacks/network-stack'
import { AppServiceStack } from '../lib/stacks/app-service-stack';
import { MigrateServiceStack } from '../lib/stacks/migrate-service-stack';
import { RdbDbStack } from '../lib/stacks/rds-stack';
import { EcrStack } from '../lib/stacks/ecr-stack';

const prefixes = {
  development: 'Dev',
  production: 'Prod'
}
const appName = 'Letspill'
const prefix = `${prefixes[nodeEnv]}`; // Dev or Prod
const appPrefix = `${prefix}${appName}` // DevLetspill, ProdLetspill

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
  repositoryName: appName.toLowerCase()
})

const appServiceStack = new AppServiceStack(app, "AppServiceStack", {
  env,
  serviceId: `${appPrefix}AppService`,
  vpc,
  appSg: appSg,
  cluster: cluster,
  repositoryName: appName.toLowerCase(),
  db: db,
  appSecretName: `${prefix}LetspillAppSecrets`,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  betterAuthUrl: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
})

const migrateServiceStack = new MigrateServiceStack(app, "MigrateServiceStack", {
  env,
  serviceId: `${appPrefix}MigrateService`,
  vpc,
  appSg: appSg,
  cluster: cluster,
  repositoryName: appName.toLowerCase(),
  db: db
})
