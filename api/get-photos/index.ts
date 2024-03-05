import {APIGatewayProxyEventV2,Context, APIGatewayProxyResultV2} from "aws-lambda"
import {S3} from "aws-sdk"
import { Bucket } from "aws-cdk-lib/aws-s3"
const bucketName = process.env.PHOTO_BUCKET_NAME
const s3 = new S3()
async function getPhotos(even:APIGatewayProxyEventV2, context:Context): Promise<APIGatewayProxyResultV2> {
    console.log("bucketName: ",bucketName)
    try{
        const results= await s3.listObjects({Bucket:bucketName}).promise()
        const photos =await  Promise.all(results?.map(result=>genearteUrl(result)))
    }
    catch(error){
        console.log("Error")
    }
    return{
        statusCode:200,
        body:"Hello from lambda"
    }
}
export {getPhotos}