#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { BffStack } from '../lib/bff-stack';
import { getBranchConfig } from '../lib/branch-config';

const app = new cdk.App();
const branchConfig = getBranchConfig();

new BffStack(app, `ChairliftBFFStack${branchConfig.stackSuffix}`, {
  branchConfig,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-west-2'
  },
  description: `Chairlift Backend for Frontend Stack (branch: ${branchConfig.branchName})`
});
