import AWS from 'aws-sdk';

const s3 = new AWS.S3({
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_KEY,
    region: process.env.REACT_APP_AWS_REGION,
    signatureVersion: 'v4',
  });

  AWS.config.update({
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_KEY,
    region: process.env.REACT_APP_AWS_REGION,
  });

  export const getSignedUrl = async (fileKey) => {

    if (!fileKey || fileKey.trim() === '') {
      console.error('Invalid fileKey provided:', fileKey);
      return null;
    }

    const params = {
      Bucket: 'arn:aws:s3:us-east-1:637423566007:accesspoint/barilanaccesspoint',
      Key: fileKey,
    };
  
    try {
      const getSignedUrl = await s3.getSignedUrl('getObject', params);
      //console.log('get getSignedUrl:', getSignedUrl);
      return getSignedUrl;
    } catch (error) {
      console.error('Error fetching getSignedUrl:', error);
      return null;
    }
  };