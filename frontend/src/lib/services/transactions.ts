// frontend pentru tranzactii 


const API_BASE_URL = "http://localhost:5000/api";

export type TransactionType = "income" | "expense";

export interface Transaction {
  _id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  date: string;
  category: string;
  note: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TransactionInput {
  type: TransactionType;
  amount: number;
  date: string;
  category: string;
  note?: string;
}

export interface TransactionFilters {
  type?: TransactionType;
  category?: string;
  startDate?: string;
  endDate?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  transaction?: T;
}

interface TransactionListResponse {
  success: boolean;
  count: number;
  transactions: Transaction[];
}

interface TransactionResponse {
  success: boolean;
  transaction: Transaction;
}

// Get the authentication token from session storage
function getAuthToken(): string {
  if (typeof window === "undefined") {
    throw new Error("Transactions service is available only in the browser.");
  }

  const token = window.sessionStorage.getItem("budgettracker_token");

  if (!token) {
    throw new Error("Your session has expired. Please log in again.");
  }

  return token;
}
// facem o cerere API cu autentificare si gestionarea erorilor
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers);

  headers.set("Accept", "application/json");
  headers.set("Authorization", `Bearer ${getAuthToken()}`);

  if (options.body) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    let message = `Request failed with status ${response.status}.`;

    if (
      typeof payload === "object" &&
      payload !== null &&
      "message" in payload &&
      typeof payload.message === "string"
    ) {
      message = payload.message;
    }

    throw new Error(message);
  }

  return payload as T;
}

/**
 * Get all transactions with optional filters.
 */
export async function getTransactions(
  filters: TransactionFilters = {}
): Promise<Transaction[]> {
  const query = new URLSearchParams();

  if (filters.type) query.set("type", filters.type);
  if (filters.category) query.set("category", filters.category);
  if (filters.startDate) query.set("startDate", filters.startDate);
  if (filters.endDate) query.set("endDate", filters.endDate);

  const queryString = query.toString();
  const endpoint = queryString
    ? `/transactions?${queryString}`
    : "/transactions";

  const result = await apiRequest<TransactionListResponse>(endpoint);

  return result.transactions;
}

/**
 * Get one transaction by ID.
 */
export async function getTransactionById(
  id: string
): Promise<Transaction> {
  const result = await apiRequest<TransactionResponse>(
    `/transactions/${encodeURIComponent(id)}`
  );

  return result.transaction;
}

/**
 * Create a new transaction.
 */
export async function createTransaction(
  data: TransactionInput
): Promise<Transaction> {
  const result = await apiRequest<TransactionResponse>(
    "/transactions",
    {
      method: "POST",
      body: JSON.stringify(data)
    }
  );

  return result.transaction;
}

/**
 * Update an existing transaction.
 */
export async function updateTransaction(
  id: string,
  data: Partial<TransactionInput>
): Promise<Transaction> {
  const result = await apiRequest<TransactionResponse>(
    `/transactions/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      body: JSON.stringify(data)
    }
  );

  return result.transaction;
}

/**
 * Delete a transaction.
 */
export async function deleteTransaction(
  id: string
): Promise<void> {
  await apiRequest<ApiResponse<never>>(
    `/transactions/${encodeURIComponent(id)}`,
    {
      method: "DELETE"
    }
  );
}
