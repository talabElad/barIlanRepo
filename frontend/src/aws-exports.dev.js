/* eslint-disable */
// WARNING: DO NOT EDIT. This file is automatically generated by AWS Amplify. It will be overwritten.

const awsmobile = {
    "aws_project_region": "us-east-1",
    "aws_cognito_identity_pool_id": "us-east-1:0889acef-d1e0-4a4f-b420-9fe530bb30d5",
    "aws_cognito_region": "us-east-1",
    "aws_user_pools_id": "us-east-1_yFeAbcXhB",
    "aws_user_pools_web_client_id": "47oeprabl0kv6j1rftoggkcmdu",
    "oauth": {
        "domain": "barilantest.auth.us-east-1.amazoncognito.com",
        "scope": [
            'openid'
        ],
        "redirectSignIn": "http://localhost:3000/homepage",
        "redirectSignOut": "http://localhost:3000",
        "responseType": "code"
    },
    "federationTarget": "COGNITO_USER_POOLS",
    "aws_cognito_username_attributes": [
        "EMAIL"
    ],
    "aws_cognito_social_providers": [],
    "aws_cognito_signup_attributes": [
        "EMAIL"
    ],
    "aws_cognito_mfa_configuration": "OFF",
    "aws_cognito_mfa_types": [
        "SMS", "EMAIL"
    ],
    "aws_cognito_password_protection_settings": {
        "passwordPolicyMinLength": "8",
        "passwordPolicyCharacters": [
            "REQUIRES_LOWERCASE",
            "REQUIRES_UPPERCASE",
            "REQUIRES_NUMBERS",
            "REQUIRES_SYMBOLS"
        ]
    },
    "aws_cognito_verification_mechanisms": [
        "PHONE_NUMBER"
    ]
};


export default awsmobile;
