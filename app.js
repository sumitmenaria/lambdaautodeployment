
'use strict'

const AWS = require('aws-sdk')
AWS.config.update({ region: process.env.AWS_REGION })
const s3 = new AWS.S3()

// Change this value to adjust the signed URL's expiration
const S3_UPLOAD_BUCKET = 's3presignedurl-s3uploadbucket-ieb1376i4aib'
const URL_EXPIRATION_SECONDS = 300
var fileType = ''
var customerID = ''
var SID = ''


// Main Lambda entry point
exports.handler = async (event) => {
  return await getUploadURL(event)
}

const getUploadURL = async function(event) {
  
   if (event.body) {
        let body = JSON.parse(event.body)
        fileType = body.items.filetype;
        customerID = body.items.customerID;
        SID = body.items.SID;
        console.log (SID)
   }
            
  const crypto = require("crypto");
  const randomID = crypto.randomBytes(16).toString("hex");
  const Key = customerID + "/" + SID + "+" + randomID + '.' + fileType 

  // Get signed URL from S3
  const s3Params = {
    Bucket: S3_UPLOAD_BUCKET,
    Key,
    Expires: URL_EXPIRATION_SECONDS
  }

  const uploadURL = await s3.getSignedUrlPromise('putObject', s3Params)

  let response = {
        statusCode: 200,
        body: JSON.stringify({
    uploadURL: uploadURL,
    Key
  })
    };
  return response
}