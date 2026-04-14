import * as cdk from "aws-cdk-lib";
import * as wafv2 from "aws-cdk-lib/aws-wafv2";
import { Construct } from "constructs";

interface PecuniaWafStackProps extends cdk.StackProps {
  apiArn: string;
}

export class PecuniaWafStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: PecuniaWafStackProps) {
    super(scope, id, props);

    const webAcl = new wafv2.CfnWebACL(this, "ApiWaf", {
      scope: "REGIONAL",
      defaultAction: { allow: {} },
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: "PecuniaWAF",
        sampledRequestsEnabled: true,
      },
      rules: [
        // AWS managed common rule set
        {
          name: "AWSManagedRulesCommonRuleSet",
          priority: 1,
          overrideAction: { none: {} },
          statement: {
            managedRuleGroupStatement: {
              vendorName: "AWS",
              name: "AWSManagedRulesCommonRuleSet",
            },
          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: "CommonRules",
            sampledRequestsEnabled: true,
          },
        },
        // Rate limit: 1000 requests per 5 minutes per IP
        {
          name: "RateLimit",
          priority: 2,
          action: { block: {} },
          statement: {
            rateBasedStatement: {
              limit: 1000,
              aggregateKeyType: "IP",
            },
          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: "RateLimit",
            sampledRequestsEnabled: true,
          },
        },
        // Block SQL injection
        {
          name: "AWSManagedRulesSQLiRuleSet",
          priority: 3,
          overrideAction: { none: {} },
          statement: {
            managedRuleGroupStatement: {
              vendorName: "AWS",
              name: "AWSManagedRulesSQLiRuleSet",
            },
          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: "SQLiRules",
            sampledRequestsEnabled: true,
          },
        },
      ],
    });

    // Associate WAF with API Gateway stage
    new wafv2.CfnWebACLAssociation(this, "WafAssociation", {
      resourceArn: props.apiArn,
      webAclArn: webAcl.attrArn,
    });
  }
}
