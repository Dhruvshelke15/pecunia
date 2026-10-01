export const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_USER_POOL_ID as string,
      userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID as string,
    },
  },
  API: {
    REST: {
      PecuniaAPI: {
        endpoint: import.meta.env.VITE_API_URL as string,
        region: "us-east-1",
      },
    },
  },
};
