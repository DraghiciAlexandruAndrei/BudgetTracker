
import type { RequestHandler } from "express";
import bcrypt from "bcryptjs";

import { UserModel } from "../models/User.js";
import { signAccessToken } from "../utils/jwt.js";

const SALT_ROUNDS = 12;

type Currency = "RON" | "EUR" | "USD";

const ALLOWED_CURRENCIES: readonly Currency[] = [
  "RON",
  "EUR",
  "USD"
];

function isCurrency(value: unknown): value is Currency {
  return (
    typeof value === "string" &&
    ALLOWED_CURRENCIES.includes(value as Currency)
  );
}

/**
 * Register a new user.
 * POST /api/auth/register
 */
export const register: RequestHandler = async (
  request,
  response
) => {
  const body: unknown = request.body;

  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body)
  ) {
    response.status(400).json({
      success: false,
      message: "Invalid request body."
    });
    return;
  }

  const {
    name,
    email,
    password,
    currency
  } = body as Record<string, unknown>;

  // Validate name
  if (typeof name !== "string" || name.trim().length < 2) {
    response.status(400).json({
      success: false,
      message: "Name must contain at least 2 characters."
    });
    return;
  }

  if (name.trim().length > 80) {
    response.status(400).json({
      success: false,
      message: "Name cannot exceed 80 characters."
    });
    return;
  }

  // Validate email
  if (
    typeof email !== "string" ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    response.status(400).json({
      success: false,
      message: "Please provide a valid email address."
    });
    return;
  }

  // Validate password
  if (
    typeof password !== "string" ||
    password.length < 8 ||
    Buffer.byteLength(password, "utf8") > 72
  ) {
    response.status(400).json({
      success: false,
      message: "Password must contain at least 8 characters and cannot exceed 72 bytes."
    });
    return;
  }

  // Validate currency
 let selectedCurrency: Currency = "RON";

if (currency !== undefined) {
  if (!isCurrency(currency)) {
    response.status(400).json({
      success: false,
      message: "Currency must be RON, EUR or USD."
    });
    return;
  }

  selectedCurrency = currency;
}

  const normalizedEmail = email.trim().toLowerCase();

  try {
    // Check whether the email is already registered
    const existingUser = await UserModel.findOne({
      email: normalizedEmail
    }).select("_id");

    if (existingUser) {
      response.status(409).json({
        success: false,
        message: "An account with this email already exists."
      });
      return;
    }

    // Hash password before saving it
    const passwordHash = await bcrypt.hash(
      password,
      SALT_ROUNDS
    );

    // Create user in MongoDB
    const user = await UserModel.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      currency: selectedCurrency
    });

    // Generate authentication token
    const accessToken = signAccessToken(user.id);

    response.status(201).json({
      success: true,
      message: "Account created successfully.",
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    // Handle duplicate email index errors
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      response.status(409).json({
        success: false,
        message: "An account with this email already exists."
      });
      return;
    }

    console.error("Registration error:", error);

    response.status(500).json({
      success: false,
      message: "An internal server error occurred."
    });
  }
};

/**
 * Authenticate an existing user.
 * POST /api/auth/login
 */
export const login: RequestHandler = async (
  request,
  response
) => {
  const body: unknown = request.body;

  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body)
  ) {
    response.status(400).json({
      success: false,
      message: "Invalid request body."
    });
    return;
  }

  const { email, password } =
    body as Record<string, unknown>;

  if (
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    response.status(400).json({
      success: false,
      message: "Please provide a valid email address."
    });
    return;
  }

  if (
    typeof password !== "string" ||
    password.length === 0 ||
    Buffer.byteLength(password, "utf8") > 72
  ) {
    response.status(400).json({
      success: false,
      message: "Invalid email or password."
    });
    return;
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();

    // Explicitly select passwordHash for verification
    const user = await UserModel.findOne({
      email: normalizedEmail
    }).select("+passwordHash");

    if (!user) {
      response.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
      return;
    }

    // Compare entered password with stored hash
    const passwordMatches = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordMatches) {
      response.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
      return;
    }

    const accessToken = signAccessToken(user.id);

    response.status(200).json({
      success: true,
      message: "Login successful.",
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error("Login error:", error);

    response.status(500).json({
      success: false,
      message: "An internal server error occurred."
    });
  }
};

/**
 * Get the currently authenticated user.
 * GET /api/auth/me
 */
export const getCurrentUser: RequestHandler = async (
  request,
  response
) => {
  const userId = request.auth?.userId;

  if (!userId) {
    response.status(401).json({
      success: false,
      message: "Authentication required."
    });
    return;
  }

  try {
    const user = await UserModel.findById(userId)
      .select("_id name email currency createdAt");

    if (!user) {
      response.status(401).json({
        success: false,
        message: "User account not found."
      });
      return;
    }

    response.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error("Get current user error:", error);

    response.status(500).json({
      success: false,
      message: "An internal server error occurred."
    });
  }
};
