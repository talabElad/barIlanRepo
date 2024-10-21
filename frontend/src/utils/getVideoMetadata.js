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

  
  export const getVideoMetadata = async (fileKey) => {

    if (!fileKey || fileKey.trim() === '') {
      console.error('Invalid fileKey provided:', fileKey);
      return null;
    }

    const params = {
      Bucket: 'arn:aws:s3:us-east-1:637423566007:accesspoint/barilanaccesspoint',
      Key: fileKey,
    };
  
    console.log('Fetching metadata for fileKey:', fileKey);

    try {
      const metadata = await s3.headObject(params).promise();
      console.log('get metadata:', metadata);
      return metadata;
    } catch (error) {
      console.error('Error fetching metadata:', error);
      return null;
    }
  };
