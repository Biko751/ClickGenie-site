import { apiRequest } from "./queryClient";

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  password: string;
  email: string;
  confirmPassword: string;
  referredBy?: number;
}

interface AuthResponse {
  user: UserData;
  sessionId: string;
}

export interface UserData {
  id: number;
  username: string;
  email: string;
  balance: number;
  clicksReceived: number;
  clicksGiven: number;
  referralCode: string;
  lastLogin?: Date;
  role?: string;
  active?: boolean;
  vipMember?: boolean;
  vipExpiry?: Date | null;
  createdAt?: Date;
  dailyLoginStreak?: number;
  lastLoginReward?: Date | null;
}

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await apiRequest('POST', '/api/auth/login', credentials);
  return await response.json();
}

export async function register(data: RegisterData): Promise<AuthResponse> {
  const response = await apiRequest('POST', '/api/auth/register', data);
  return await response.json();
}

export async function logout(sessionId: string): Promise<void> {
  await apiRequest('POST', '/api/auth/logout', null, {
    headers: {
      'Authorization': `Bearer ${sessionId}`
    }
  });
}

export async function getCurrentUser(sessionId: string): Promise<UserData> {
  const response = await apiRequest('GET', '/api/user', null, {
    headers: {
      'Authorization': `Bearer ${sessionId}`
    }
  });
  return await response.json();
}

// Function to save session to localStorage
export function saveSession(sessionId: string, userData: UserData): void {
  localStorage.setItem('sessionId', sessionId);
  localStorage.setItem('userData', JSON.stringify(userData));
}

// Function to clear session from localStorage
export function clearSession(): void {
  localStorage.removeItem('sessionId');
  localStorage.removeItem('userData');
}

// Function to get session from localStorage
export function getStoredSession(): { sessionId: string | null, userData: UserData | null } {
  const sessionId = localStorage.getItem('sessionId');
  const userDataStr = localStorage.getItem('userData');
  
  let userData = null;
  if (userDataStr) {
    try {
      userData = JSON.parse(userDataStr);
    } catch (e) {
      console.error('Failed to parse stored user data');
    }
  }
  
  return { sessionId, userData };
}
