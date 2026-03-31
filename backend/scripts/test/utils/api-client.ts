import { testConfig } from '../config/test.config';

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  headers: any;
}

export class ApiClient {
  private baseUrl: string;
  private token: string | null = null;
  private defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  constructor(baseUrl: string = testConfig.apiBaseUrl) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string): void {
    this.token = token;
  }

  clearToken(): void {
    this.token = null;
  }

  private getHeaders(): Record<string, string> {
    const headers = { ...this.defaultHeaders };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    const json = await response.json();
    
    // Throw error if response is not ok (status >= 400)
    if (!response.ok) {
      const error: any = new Error(`HTTP ${response.status}: ${json.message || 'Request failed'}`);
      error.response = {
        status: response.status,
        data: json,
      };
      throw error;
    }
    
    // Handle nested data from transform interceptor
    const data = json.data || json;
    
    return {
      data: data,
      status: response.status,
      headers: response.headers,
    };
  }

  async post<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });

    const json = await response.json();
    
    // Throw error if response is not ok (status >= 400)
    if (!response.ok) {
      const error: any = new Error(`HTTP ${response.status}: ${json.message || 'Request failed'}`);
      error.response = {
        status: response.status,
        data: json,
      };
      throw error;
    }
    
    // Handle nested data from transform interceptor
    const data = json.data || json;
    
    return {
      data: data,
      status: response.status,
      headers: response.headers,
    };
  }

  async patch<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });

    const json = await response.json();
    // Handle nested data from transform interceptor
    const data = json.data || json;
    
    return {
      data: data,
      status: response.status,
      headers: response.headers,
    };
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    const json = await response.json();
    
    // Throw error if response is not ok (status >= 400)
    if (!response.ok) {
      const error: any = new Error(`HTTP ${response.status}: ${json.message || 'Request failed'}`);
      error.response = {
        status: response.status,
        data: json,
      };
      throw error;
    }
    
    // Handle nested data from transform interceptor
    const data = json.data || json;
    
    return {
      data: data,
      status: response.status,
      headers: response.headers,
    };
  }

  async uploadFile(endpoint: string, file: File | Blob, fieldName: string = 'file'): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append(fieldName, file);

    const headers: Record<string, string> = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const json = await response.json();
    // Handle nested data from transform interceptor
    const data = json.data || json;
    
    return {
      data: data,
      status: response.status,
      headers: response.headers,
    };
  }
}

// Singleton instance
export const apiClient = new ApiClient();
