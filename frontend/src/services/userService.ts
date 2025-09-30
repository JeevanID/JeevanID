// User Service for handling user-related API calls
const baseURL = "https://jeevanid-production.up.railway.app/api";
export interface UserResponse {
  success: boolean;
  message: string;
  data?: any;
  errors?: any[];
}

export interface RegisterUserRequest {
  fullName: string;
  mobileNumber: string;
  dateOfBirth: string;
  aadhaar: string;
}

export interface LoginUserRequest {
  mobileNumber?: string;
  jeevanId?: string;
}

export interface User {
  id: string;
  jeevanId: string;
  fullName: string;
  mobileNumber: string;
  dateOfBirth: string;
  profilePhoto: string | null;
  verified: boolean;
  createdAt: string;
}

class UserService {
  private baseURL = import.meta.env.VITE_API_URL || 'https://jeevanid-production.up.railway.app/api';

  // Make HTTP request with error handling
  private async makeRequest(endpoint: string, options: RequestInit): Promise<UserResponse> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          message: data.message || `HTTP error! status: ${response.status}`,
          data: data.data,
          errors: data.errors
        };
      }

      return data;
    } catch (error) {
      console.error('User Service Error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error occurred',
        data: null
      };
    }
  }

  // Register new user
  async registerUser(request: RegisterUserRequest): Promise<UserResponse> {
    console.log(`📝 Registering user: ${request.fullName} (${request.mobileNumber})`);
    
    return this.makeRequest('/users/register', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }

  // Login user
  async loginUser(request: LoginUserRequest): Promise<UserResponse> {
    const identifier = request.mobileNumber || request.jeevanId;
    console.log(`🔐 Logging in user: ${identifier}`);
    
    return this.makeRequest('/users/login', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }

  // Get user profile
  async getUserProfile(identifier: string): Promise<UserResponse> {
    console.log(`👤 Getting profile for: ${identifier}`);
    
    return this.makeRequest(`/users/profile/${encodeURIComponent(identifier)}`, {
      method: 'GET'
    });
  }

  // Get health status
  async getHealthStatus(): Promise<UserResponse> {
    return this.makeRequest('/health', {
      method: 'GET'
    });
  }

  // Check if backend is available
  async checkConnection(): Promise<boolean> {
    try {
      const response = await this.getHealthStatus();
      return response.success;
    } catch (error) {
      console.error('Backend connection check failed:', error);
      return false;
    }
  }

  // Store user data in localStorage
  storeUserData(user: User, token: string): void {
    localStorage.setItem('jeevanUser', JSON.stringify(user));
    localStorage.setItem('jeevanToken', token);
  }

  // Get user data from localStorage
  getUserData(): User | null {
    try {
      const userData = localStorage.getItem('jeevanUser');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  // Get token from localStorage
  getToken(): string | null {
    return localStorage.getItem('jeevanToken');
  }

  // Clear user data from localStorage
  clearUserData(): void {
    localStorage.removeItem('jeevanUser');
    localStorage.removeItem('jeevanToken');
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!(this.getUserData() && this.getToken());
  }
}

export const userService = new UserService();