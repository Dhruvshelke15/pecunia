import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';
import * as path from 'path';

interface PecuniaApiStackProps extends cdk.StackProps {
  table: dynamodb.Table;
  userPool: cognito.UserPool; 
}

export class PecuniaApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: PecuniaApiStackProps) {
    super(scope, id, props);

    // 1. Defining the Lambda 
    const createRevenueLambda = new nodejs.NodejsFunction(this, 'CreateRevenueHandler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, '../backend/src/handlers/createRevenue.ts'),
      handler: 'handler',
      environment: {
        TABLE_NAME: props.table.tableName,
      },
    });

    props.table.grantWriteData(createRevenueLambda);

    // 2. Define the Authorizer
    // connects API Gateway to Cognito
    const auth = new apigateway.CognitoUserPoolsAuthorizer(this, 'PecuniaAuthorizer', {
      cognitoUserPools: [props.userPool],
    });

    // 3. Create the API
    const api = new apigateway.RestApi(this, 'PecuniaApi', {
      restApiName: 'Pecunia Service',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    const revenueResource = api.root.addResource('revenue');

    // 4. Secure the Endpoint
    // requests MUST have a valid JWT.
    revenueResource.addMethod('POST', new apigateway.LambdaIntegration(createRevenueLambda), {
      authorizer: auth,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    // 5. Define the GET Lambda
    const getRevenueLambda = new nodejs.NodejsFunction(this, 'GetRevenueHandler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, '../backend/src/handlers/getRevenue.ts'), // <--- Point to new file
      handler: 'handler',
      environment: {
        TABLE_NAME: props.table.tableName,
      },
    });

    // 6. Grant Read Permissions
    props.table.grantReadData(getRevenueLambda);

    // 7. Add GET Method to the /revenue resource
    // Reusing the existing 'revenueResource' and 'auth' variables
    revenueResource.addMethod('GET', new apigateway.LambdaIntegration(getRevenueLambda), {
      authorizer: auth,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    // 8. Define DELETE Lambda
    const deleteEntryLambda = new nodejs.NodejsFunction(this, 'DeleteEntryHandler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, '../backend/src/handlers/deleteEntry.ts'),
      handler: 'handler',
      environment: {
        TABLE_NAME: props.table.tableName,
      },
    });

    // 9. Grant Permissions
    props.table.grantWriteData(deleteEntryLambda);

    // 10. Add Route: DELETE /revenue/{id}
    // adding a child resource "{id}" to the existing "revenue" resource
    const singleEntryResource = revenueResource.addResource('{id}');
    
    singleEntryResource.addMethod('DELETE', new apigateway.LambdaIntegration(deleteEntryLambda), {
      authorizer: auth,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
  }
}