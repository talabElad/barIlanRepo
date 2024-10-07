import Amplify from 'aws-amplify';

Amplify.configure({
  Auth: {
    region: 'us-east-1_g3y6Tm4Mk',
    userPoolId: 'us-east-1_g3y6Tm4Mk',
    userPoolWebClientId: '38kqhp6t3ve051t00vaot0k7be',
  },
  Storage: {
    AWSS3: {
      bucket: 'barilanbucket',
      region: 'us-east-1_g3y6Tm4Mk',
    },
  },
});
