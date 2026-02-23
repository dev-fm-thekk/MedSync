/**
 * API Configuration
 * 
 * This file provides a centralized configuration for all backend API calls.
 * The base URL is determined from environment variables, making it easy to
 * switch between different environments (local, staging, production) without
 * changing any code paths.
 */

// Get base URL from environment or default to localhost
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://6kczd7qg-8080.inc1.devtunnels.ms/";

// n8n RAG: chat webhook (POST { question } → { answer }) and upload-pdf (POST multipart PDF → embeddings)
const N8N_RAG_WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_RAG_WEBHOOK_URL || "";
const N8N_RAG_UPLOAD_PDF_URL = process.env.NEXT_PUBLIC_N8N_RAG_UPLOAD_PDF_URL || "";

export const apiConfig = {
  baseURL: API_BASE_URL,

  n8nRagWebhookUrl: N8N_RAG_WEBHOOK_URL,
  n8nRagUploadPdfUrl: N8N_RAG_UPLOAD_PDF_URL,

  // API endpoints (paths only - combined with baseURL at runtime)
  endpoints: {
    // Medical Records endpoints
    mintRecord: (userId: string) => `/v1/records/${userId}/mint`,
    grantAccess: (userId: string) => `/v1/records/access/${userId}/grant`,
    getRecord: (tokenId: string) => `/v1/records/${tokenId}`,

    // System endpoints
    systemStatus: "/v1/system/status",
  },

  // Default headers for all requests
  defaultHeaders: {
    "Content-Type": "application/json",
  },

  // Get full URL for any endpoint
  getFullUrl: (endpoint: string): string => {
    // Remove leading slash if present to avoid double slashes
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    return `${API_BASE_URL}${cleanEndpoint}`;
  },

  // Get full URL with query parameters
  getFullUrlWithQuery: (endpoint: string, queryParams?: Record<string, string | number>): string => {
    const baseUrl = apiConfig.getFullUrl(endpoint);
    if (!queryParams) return baseUrl;

    const params = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, value]) => {
      params.append(key, String(value));
    });

    return `${baseUrl}?${params.toString()}`;
  },
};

export default apiConfig;
