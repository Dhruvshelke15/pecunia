#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { PecuniaDatabaseStack } from "../lib/database-stack";
import { PecuniaAuthStack } from "../lib/auth-stack";
import { PecuniaApiStack } from "../lib/api-stack";
import { PecuniaFrontendStack } from "../lib/frontend-stack";
import { PecuniaWafStack } from "../lib/waf-stack";

const env: cdk.Environment = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new cdk.App();

const dbStack = new PecuniaDatabaseStack(app, "PecuniaDatabaseStack", { env });
const authStack = new PecuniaAuthStack(app, "PecuniaAuthStack", { env });
const apiStack = new PecuniaApiStack(app, "PecuniaApiStack", {
  env,
  table: dbStack.table,
  userPool: authStack.userPool,
  allowedOrigin: process.env.FRONTEND_ORIGIN ?? "*",
  anthropicSecretArn: `arn:aws:secretsmanager:${process.env.CDK_DEFAULT_REGION}:${process.env.CDK_DEFAULT_ACCOUNT}:secret:pecunia/anthropic-api-key`,
});

new PecuniaWafStack(app, "PecuniaWafStack", {
  env,
  apiArn: apiStack.apiStageArn,
});

new PecuniaFrontendStack(app, "PecuniaFrontendStack", {
  env,
  apiUrl: apiStack.apiUrl,
});
