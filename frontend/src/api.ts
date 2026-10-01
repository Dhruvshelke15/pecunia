import { fetchAuthSession } from 'aws-amplify/auth';
import axios from 'axios';
import { awsConfig } from './aws-exports';

// Safely access the endpoint URL from the new v6 config structure
const API_URL = awsConfig.API?.REST?.['PecuniaAPI']?.endpoint;

if (!API_URL) {
  console.error("API URL not found in aws-exports.ts");
}

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Runs before every request to inject the Token
api.interceptors.request.use(async (config) => {
  try {
    const session = await fetchAuthSession();
    // In v6, idToken is undefined if not signed in, so we check carefully
    const token = session.tokens?.idToken?.toString();
    
    if (token) {
      config.headers.Authorization = token; 
    }
  } catch (error) {
    console.error("Error fetching auth session", error);
  }
  return config;
});