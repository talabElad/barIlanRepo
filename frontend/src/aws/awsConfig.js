import AWS from 'aws-sdk';

const dynamoDB = new AWS.DynamoDB.DocumentClient({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_KEY,
  region: process.env.REACT_APP_AWS_REGION,
});

export default dynamoDB;
