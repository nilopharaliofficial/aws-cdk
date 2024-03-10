import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Bucket, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import * as sqs from 'aws-cdk-lib/aws-sqs';

import { BucketDeployment, } from 'aws-cdk-lib/aws-s3-deployment';
import * as s3Deployment from 'aws-cdk-lib/aws-s3-deployment';
import path = require('path');
import { Handler, Runtime } from 'aws-cdk-lib/aws-lambda';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { HttpApi } from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpMethod } from 'aws-cdk-lib/aws-events';
import { LambdaIntegration } from 'aws-cdk-lib/aws-apigateway';
//import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
// import { Lambda } from 'aws-cdk-lib/aws-ses-actions';
// declare const booksDefaultFn: Lambda.Function;


declare const booksDefaultFn: cdk.aws_lambda.Function

export class NewAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    const bucket = new Bucket(this,"NewAppBucket",{
      encryption:BucketEncryption.S3_MANAGED,

    });
  
    new BucketDeployment(this, "NewAppPhotos",{
      sources :[
        s3Deployment.Source.asset(path.join(__dirname,"..","photos"))
      ],
      destinationBucket:bucket
    });


    const getPhotos = new cdk.aws_lambda_nodejs.NodejsFunction(this,"MyNewLambda",{
      runtime:Runtime.NODEJS_18_X,
      entry:path.join(__dirname,"..","api","get-photos","index.ts"),
      handler:"getPhotos",
      environment:{
        PHOTO_BUCKET_NAME:bucket.bucketName
      },  
    });

    const bucketContainerPermission = new PolicyStatement();
    bucketContainerPermission.addResources(bucket.bucketArn);
    bucketContainerPermission.addActions('s3:ListBucket');

    const bucketPermissions = new PolicyStatement();
    bucketPermissions.addResources(`${bucket.bucketArn}/*`);
    bucketPermissions.addActions('s3:GetObject', 's3:PutObject');

    getPhotos.addToRolePolicy(bucketPermissions);
    getPhotos.addToRolePolicy(bucketContainerPermission);


    const httpApi = new HttpApi(this, 'MySimpleAppHttpApi',{
      corsPreflight:{
        allowOrigins: ['*'],
        allowMethods:[cdk.aws_apigatewayv2.CorsHttpMethod.GET]
      },
      apiName: 'photo-api',
      createDefaultStage: true
    })


    // const HttplambdaIntegration   = new  HttpUrlIntegration({
    //   Handler: getPhotos
    // });
    const LambdaIntegration = new HttpLambdaIntegration('photosIntegration', getPhotos);

    
    httpApi.addRoutes({
      path:'/getAllPhotos',
      methods: [
        HttpMethod.GET,
      ],
      integration: LambdaIntegration
    });
      

  //const getPhotos = new lambda.NodejsFunction(this,"MyNewLambda
    new cdk.CfnOutput(this,"NewAppBucketNameExport",{
      value:bucket.bucketName,
      exportName:"NewAppBucketName"
    });


    new cdk.CfnOutput(this,"MySimpleAppApi",{
      value:httpApi.url!,
      exportName: "MySimpleAppApiEndPoint"
    });


    //const websiteBucket = new Bucket(this, 'NewWebsiteBucket',{
     //websiteIndexDocument: 'index.html',
     //publicReadAccess: true

    //});
    //The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'NewAppQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}

