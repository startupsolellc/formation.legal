/**
 * DataForSEO API Client
 *
 * Usage:
 *   import { getDataForSeoClient } from '@/lib/dataforseo';
 *
 * For SERP data:
 *   const client = await getDataForSeoClient();
 *   const result = await client.googleOrganicLiveAdvanced([task]);
 *
 * For Keywords Data:
 *   import * as keywordsClient from 'dataforseo-client';
 *   const keywordsApi = new keywordsClient.KeywordsDataApi(baseUrl, { fetch: authFetch });
 */

import * as client from 'dataforseo-client';

type AuthenticatedFetch = (url: RequestInfo, init?: RequestInit) => Promise<Response>;

// Singleton client instances
let cachedSerpClient: client.SerpApi | null = null;
let cachedKeywordsClient: client.KeywordsDataApi | null = null;

function createAuthenticatedFetch(username: string, password: string): AuthenticatedFetch {
  return (url: RequestInfo, init?: RequestInit): Promise<Response> => {
    const token = Buffer.from(`${username}:${password}`).toString('base64');
    const authHeader = { Authorization: `Basic ${token}` };

    const newInit: RequestInit = {
      ...init,
      headers: {
        ...init?.headers,
        ...authHeader,
      },
    };

    return fetch(url, newInit);
  };
}

function getCredentials() {
  const username = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;
  const baseUrl = process.env.DATAFORSEO_API_URL || 'https://api.dataforseo.com';

  if (!username || !password) {
    throw new Error('DataForSEO credentials not found. Please set DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD in your .env file.');
  }

  return { username, password, baseUrl };
}

export async function getSerpClient(): Promise<client.SerpApi> {
  if (cachedSerpClient) {
    return cachedSerpClient;
  }

  const { username, password, baseUrl } = getCredentials();
  const authFetch = createAuthenticatedFetch(username, password);
  cachedSerpClient = new client.SerpApi(baseUrl, { fetch: authFetch });

  return cachedSerpClient;
}

export async function getKeywordsClient(): Promise<client.KeywordsDataApi> {
  if (cachedKeywordsClient) {
    return cachedKeywordsClient;
  }

  const { username, password, baseUrl } = getCredentials();
  const authFetch = createAuthenticatedFetch(username, password);
  cachedKeywordsClient = new client.KeywordsDataApi(baseUrl, { fetch: authFetch });

  return cachedKeywordsClient;
}

// Backward compatibility alias
export async function getDataForSeoClient(): Promise<client.SerpApi> {
  return getSerpClient();
}

/**
 * Test connection to DataForSEO API
 */
export async function testConnection(): Promise<{
  success: boolean;
  message: string;
  organicResults?: number;
  topDomains?: string[];
  cost?: number;
}> {
  try {
    const api = await getSerpClient();

    // Make a simple SERP request to test credentials
    const task = new client.SerpGoogleOrganicLiveAdvancedRequestInfo();
    task.keyword = 'llc formation non-resident';
    task.location_code = 2840; // United States
    task.language_code = 'en';

    const response = await api.googleOrganicLiveAdvanced([task]);

    // Check if we got valid response
    if (response.tasks && response.tasks[0]?.result) {
      const result = (response.tasks[0].result as any)[0];
      const organicResults = result.items?.filter((i: any) => i.type === 'organic') || [];
      const topDomains = organicResults.slice(0, 5).map((i: any) => i.domain);

      return {
        success: true,
        message: 'DataForSEO API connection successful',
        organicResults: organicResults.length,
        topDomains,
        cost: response.tasks[0].cost,
      };
    }

    if (response.tasks?.[0]?.status_message) {
      return {
        success: false,
        message: `API Error: ${response.tasks[0].status_message}`,
      };
    }

    return {
      success: false,
      message: `Unexpected response: ${JSON.stringify(response)}`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Provide more helpful error messages
    if (errorMessage.includes('401')) {
      return {
        success: false,
        message: 'Authentication failed. Please check your DataForSEO credentials.',
      };
    }

    if (errorMessage.includes('fetch')) {
      return {
        success: false,
        message: `Network error: ${errorMessage}`,
      };
    }

    return {
      success: false,
      message: `Error: ${errorMessage}`,
    };
  }
}

// Re-export types for convenience
export type { SerpApi } from 'dataforseo-client';
export type { KeywordsDataApi } from 'dataforseo-client';
export { SerpGoogleOrganicLiveAdvancedRequestInfo } from 'dataforseo-client';