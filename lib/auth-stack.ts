import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';

export class PecuniaAuthStack extends cdk.Stack {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1. Create User Pool
    // "Cognito User Pool" handles identity
    this.userPool = new cognito.UserPool(this, 'PecuniaUserPool', {
      userPoolName: 'pecunia-users',
      selfSignUpEnabled: true, // Allow users to register themselves
      signInAliases: { email: true }, // Users sign in with email
      autoVerify: { email: true }, // Verify emails automatically (simplifies testing)
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireDigits: true,
      },
    });

    // 2. Create App Client 
    // The "Client" (SPA) needs this to authenticate
    this.userPoolClient = new cognito.UserPoolClient(this, 'PecuniaAppClient', {
      userPool: this.userPool,
      authFlows: {
        userSrp: true,
        userPassword: true,
      },
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: [cognito.OAuthScope.OPENID],
      },
    });

    // 3. Output IDs for the Frontend
    new cdk.CfnOutput(this, 'UserPoolId', { value: this.userPool.userPoolId });
    new cdk.CfnOutput(this, 'UserPoolClientId', { value: this.userPoolClient.userPoolClientId });
  }
}