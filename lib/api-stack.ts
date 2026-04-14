import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as nodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import * as path from "path";

interface PecuniaApiStackProps extends cdk.StackProps {
  table: dynamodb.Table;
  userPool: cognito.UserPool;
  allowedOrigin: string;
  anthropicSecretArn: string;
}

export class PecuniaApiStack extends cdk.Stack {
  public readonly apiUrl: string;
  public readonly apiStageArn: string;

  constructor(scope: Construct, id: string, props: PecuniaApiStackProps) {
    super(scope, id, props);

    const commonEnv = {
      TABLE_NAME: props.table.tableName,
      ALLOWED_ORIGIN: props.allowedOrigin,
    };

    const commonLambdaProps = {
      runtime: lambda.Runtime.NODEJS_20_X,
      environment: commonEnv,
    };

    // 1. Create Lambda
    const createRevenueLambda = new nodejs.NodejsFunction(
      this,
      "CreateRevenueHandler",
      {
        ...commonLambdaProps,
        entry: path.join(__dirname, "../backend/src/handlers/createRevenue.ts"),
        handler: "handler",
      },
    );
    props.table.grantWriteData(createRevenueLambda);

    // 2. Get Lambda
    const getRevenueLambda = new nodejs.NodejsFunction(
      this,
      "GetRevenueHandler",
      {
        ...commonLambdaProps,
        entry: path.join(__dirname, "../backend/src/handlers/getRevenue.ts"),
        handler: "handler",
      },
    );
    props.table.grantReadData(getRevenueLambda);

    // 3. Delete Lambda
    const deleteEntryLambda = new nodejs.NodejsFunction(
      this,
      "DeleteEntryHandler",
      {
        ...commonLambdaProps,
        entry: path.join(__dirname, "../backend/src/handlers/deleteEntry.ts"),
        handler: "handler",
      },
    );
    props.table.grantWriteData(deleteEntryLambda);

    // 4. Get by category Lambda
    const getByCategoryLambda = new nodejs.NodejsFunction(
      this,
      "GetByCategoryHandler",
      {
        ...commonLambdaProps,
        entry: path.join(__dirname, "../backend/src/handlers/getByCategory.ts"),
        handler: "handler",
      },
    );
    props.table.grantReadData(getByCategoryLambda);

    // 5. AI chat Lambda
    const aiChatLambda = new nodejs.NodejsFunction(this, "AiChatHandler", {
      ...commonLambdaProps,
      entry: path.join(__dirname, "../backend/src/handlers/aiChat.ts"),
      handler: "handler",
      timeout: cdk.Duration.seconds(30),
      environment: {
        ...commonEnv,
        ANTHROPIC_SECRET_ARN: props.anthropicSecretArn,
      },
    });
    props.table.grantReadData(aiChatLambda);
    aiChatLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["secretsmanager:GetSecretValue"],
        resources: [props.anthropicSecretArn],
      }),
    );

    // 6. Cognito authorizer
    const auth = new apigateway.CognitoUserPoolsAuthorizer(
      this,
      "PecuniaAuthorizer",
      {
        cognitoUserPools: [props.userPool],
      },
    );

    const authOptions = {
      authorizer: auth,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    };

    // 7. API Gateway
    const api = new apigateway.RestApi(this, "PecuniaApi", {
      restApiName: "Pecunia Service",
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    // /revenue
    const revenueResource = api.root.addResource("revenue");
    revenueResource.addMethod(
      "POST",
      new apigateway.LambdaIntegration(createRevenueLambda),
      authOptions,
    );
    revenueResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(getRevenueLambda),
      authOptions,
    );

    // /revenue/{id}
    const singleEntryResource = revenueResource.addResource("{id}");
    singleEntryResource.addMethod(
      "DELETE",
      new apigateway.LambdaIntegration(deleteEntryLambda),
      authOptions,
    );

    // /revenue/category/{category}
    const categoryResource = revenueResource
      .addResource("category")
      .addResource("{category}");
    categoryResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(getByCategoryLambda),
      authOptions,
    );

    // /chat
    const chatResource = api.root.addResource("chat");
    chatResource.addMethod(
      "POST",
      new apigateway.LambdaIntegration(aiChatLambda),
      authOptions,
    );

    // 8. Outputs
    this.apiUrl = api.url;
    this.apiStageArn = `arn:aws:apigateway:${this.region}::/restapis/${api.restApiId}/stages/${api.deploymentStage.stageName}`;

    new cdk.CfnOutput(this, "ApiUrl", { value: api.url });
    new cdk.CfnOutput(this, "ApiStageArn", { value: this.apiStageArn });
  }
}
