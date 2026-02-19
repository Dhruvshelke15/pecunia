import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class PecuniaDatabaseStack extends cdk.Stack {
  public readonly table: dynamodb.Table;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1. Create the Table
    // "serverless backend" & "Minimal maintenance"
    this.table = new dynamodb.Table(this, 'RevenueTable', {
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING }, 
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },      
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST, 
      removalPolicy: cdk.RemovalPolicy.DESTROY, 
    });

    // 2. Output the Table Name
    // Allows other stacks (like your API) to know the table name
    new cdk.CfnOutput(this, 'TableName', {
      value: this.table.tableName,
    });
  }
}