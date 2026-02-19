#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { PecuniaDatabaseStack } from '../lib/database-stack';
import { PecuniaAuthStack } from '../lib/auth-stack';
import { PecuniaApiStack } from '../lib/api-stack';

const app = new cdk.App();

// 1. Database
const dbStack = new PecuniaDatabaseStack(app, 'PecuniaDatabaseStack');

// 2. Authentication
const authStack = new PecuniaAuthStack(app, 'PecuniaAuthStack');

// 3. API (Needs both DB and Auth)
new PecuniaApiStack(app, 'PecuniaApiStack', {
  table: dbStack.table,
  userPool: authStack.userPool, // Pass the User Pool to the API
});