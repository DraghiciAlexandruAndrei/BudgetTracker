
const API_URL = "http://localhost:5000/api";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  currency: "RON" | "EUR" | "USD";
  createdAt: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  accessToken: string;
  user: AuthUser;
}

interface UserResponse {
  success: boolean;
  user: AuthUser;
}

function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return sessionStorage.getItem("budgettracker_token");
}

function saveToken(token: string): void {
  sessionStorage.setItem("budgettracker_token", token);
}

function clearToken(): void {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("budgettracker_token");
  }
}

async function handleAuthResponse(
  response: Response
): Promise<AuthResponse> {
  const data = await response.json() as AuthResponse;

  if (!response.ok) {
    throw new Error(data.message || "Authentication failed.");
  }

  if (!data.accessToken) {
    throw new Error("Authentication token was not received.");
  }

  saveToken(data.accessToken);

  return data;
}

export async function register(
  name: string,
  email: string,
  password: string,
  currency: "RON" | "EUR" | "USD"
): Promise<AuthUser> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name,
      email,
      password,
      currency
    })
  });

  const data = await handleAuthResponse(response);

  return data.user;
}

export async function login(
  email: string,
  password: string
): Promise<AuthUser> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email,
      password
    })
  });

  const data = await handleAuthResponse(response);

  return data.user;
}

export async function getCurrentUser(): Promise<AuthUser> {
  const token = getToken();

  if (!token) {
    throw new Error("You are not authenticated.");
  }

  const response = await fetch(`${API_URL}/auth/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    clearToken();
    throw new Error("Your session has expired.");
  }

  const data = await response.json() as UserResponse;

  return data.user;
}

export function logout(): void {
  clearToken();
}
