import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Bucket, BucketEncryption } from 'aws-cdk-lib/aws-s3';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

import { BucketDeployment, } from 'aws-cdk-lib/aws-s3-deployment';
import * as s3Deployment from 'aws-cdk-lib/aws-s3-deployment';
import path = require('path');
import { Runtime } from 'aws-cdk-lib/aws-lambda';


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
      }
    })
    // const getPhotos = new lambda.NodejsFunction(this,"MyNewLambda",{

    // })
    new cdk.CfnOutput(this,"NewAppBucketNameExport",{
      value:bucket.bucketName,
      exportName:"NewAppBucketName"
    })


    // const websiteBucket = new Bucket(this, 'NewWebsiteBucket',{
    //   websiteIndexDocument: 'index.html',
    //   publicReadAccess: true

    // })
    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'NewAppQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}

