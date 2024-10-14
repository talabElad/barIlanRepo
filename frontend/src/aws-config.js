import Amplify from 'aws-amplify';

Amplify.configure({
  Auth: {
    region: 'us-east-1_yFeAbcXhB',
    userPoolId: 'us-east-1_yFeAbcXhB',
    userPoolWebClientId: '38kqhp6t3ve051t00vaot0k7be',
  },
  Storage: {
    AWSS3: {
      bucket: 'barilan24elad',
      region: 'us-east-1',
    },
  },
});
