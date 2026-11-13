
import { createContext } from "svelte";

import type { AuthUser } from "#lib/services/auth.js";

import {
  getCurrentUser,
  hasStoredToken,
  login,
  logout,
  register
} from "#lib/services/auth.js";

export type AuthStatus =
  | "loading"
  | "authenticated"
  | "unauthenticated"
  | "error";

export interface AuthSession {
  state: {
    user: AuthUser | null;
    status: AuthStatus;
    errorMessage: string | null;
  };

  initialize(): Promise<void>;

  signIn(email: string, password: string): Promise<AuthUser>;

  signUp(
    name: string,
    email: string,
    password: string,
    currency: "RON" | "EUR" | "USD"
  ): Promise<AuthUser>;

  signOut(): void;
}

export const [
  getAuthSession,
  setAuthSession
] = createContext<AuthSession>();

export function createAuthSession(): AuthSession {
  const state = $state({
    user: null as AuthUser | null,
    status: "loading" as AuthStatus,
    errorMessage: null as string | null
  });

  let initializationPromise: Promise<void> | null = null;

  return {
    state,

    async initialize(): Promise<void> {
      if (initializationPromise) {
        return initializationPromise;
      }

      initializationPromise = (async () => {
        if (!hasStoredToken()) {
          state.status = "unauthenticated";
          return;
        }

        try {
          state.user = await getCurrentUser();
          state.status = "authenticated";
          state.errorMessage = null;
        } catch (error) {
          state.user = null;
          state.errorMessage =
            error instanceof Error
              ? error.message
              : "Unable to verify your session.";

          state.status = hasStoredToken()
            ? "error"
            : "unauthenticated";
        }
      })();

      return initializationPromise;
    },

    async signIn(
      email: string,
      password: string
    ): Promise<AuthUser> {
      state.errorMessage = null;

      const user = await login(email, password);

      state.user = user;
      state.status = "authenticated";

      return user;
    },

    async signUp(
      name: string,
      email: string,
      password: string,
      currency: "RON" | "EUR" | "USD"
    ): Promise<AuthUser> {
      state.errorMessage = null;

      const user = await register(
        name,
        email,
        password,
        currency
      );

      state.user = user;
      state.status = "authenticated";

      return user;
    },

    signOut(): void {
      logout();

      state.user = null;
      state.status = "unauthenticated";
      state.errorMessage = null;
    }
  };
}
