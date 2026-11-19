// transaction controller 
import type { RequestHandler } from "express";
import { Types } from "mongoose";

import { TransactionModel } from "../models/Transaction.js";

type TransactionType = "income" | "expense";

interface TransactionUpdates {
  type?: TransactionType;
  amount?: number;
  date?: Date;
  category?: string;
  note?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function isTransactionType(value: unknown): value is TransactionType {
  return value === "income" || value === "expense";
}

function isValidAmount(value: unknown): value is number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value <= 0
  ) {
    return false;
  }

  // Allow at most two decimal places, accounting for floating-point precision.
  return Math.abs(value * 100 - Math.round(value * 100)) < 1e-8;
}

function parseTransactionDate(value: unknown): Date | null {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function getAuthenticatedUserId(
  request: Parameters<RequestHandler>[0]
): string | null {
  return request.auth?.userId ?? null;
}

/**
 * Create a transaction.
 * POST /api/transactions
 */
export const createTransaction: RequestHandler = async (
  request,
  response
) => {
  const userId = getAuthenticatedUserId(request);

  if (!userId) {
    response.status(401).json({
      success: false,
      message: "Authentication required."
    });
    return;
  }

  const body: unknown = request.body;

  if (!isRecord(body)) {
    response.status(400).json({
      success: false,
      message: "Invalid request body."
    });
    return;
  }

  const { type, amount, date, category, note } = body;

  if (!isTransactionType(type)) {
    response.status(400).json({
      success: false,
      message: "Type must be income or expense."
    });
    return;
  }

  if (!isValidAmount(amount)) {
    response.status(400).json({
      success: false,
      message: "Amount must be positive and have at most two decimal places."
    });
    return;
  }

  const transactionDate = parseTransactionDate(date);

  if (!transactionDate) {
    response.status(400).json({
      success: false,
      message: "Please provide a valid transaction date."
    });
    return;
  }

  if (
    typeof category !== "string" ||
    category.trim().length < 2 ||
    category.trim().length > 50
  ) {
    response.status(400).json({
      success: false,
      message: "Category must contain between 2 and 50 characters."
    });
    return;
  }

  if (
    note !== undefined &&
    (typeof note !== "string" || note.trim().length > 500)
  ) {
    response.status(400).json({
      success: false,
      message: "Note cannot exceed 500 characters."
    });
    return;
  }

  try {
    const transaction = await TransactionModel.create({
      userId,
      type,
      amount,
      date: transactionDate,
      category: category.trim(),
      note: typeof note === "string" ? note.trim() : ""
    });

    response.status(201).json({
      success: true,
      message: "Transaction created successfully.",
      transaction
    });
  } catch (error) {
    console.error("Create transaction error:", error);

    response.status(500).json({
      success: false,
      message: "An internal server error occurred."
    });
  }
};

/**
 * Get all transactions belonging to the authenticated user.
 * GET /api/transactions
 */
export const getTransactions: RequestHandler = async (
  request,
  response
) => {
  const userId = getAuthenticatedUserId(request);

  if (!userId) {
    response.status(401).json({
      success: false,
      message: "Authentication required."
    });
    return;
  }

  try {
    const transactions = await TransactionModel.find({
      userId
    }).sort({
      date: -1,
      createdAt: -1
    });

    response.status(200).json({
      success: true,
      count: transactions.length,
      transactions
    });
  } catch (error) {
    console.error("Get transactions error:", error);

    response.status(500).json({
      success: false,
      message: "An internal server error occurred."
    });
  }
};

/**
 * Get a single transaction belonging to the authenticated user.
 * GET /api/transactions/:id
 */
export const getTransactionById: RequestHandler = async (
  request,
  response
) => {
  const userId = getAuthenticatedUserId(request);
  const transactionId = request.params.id;

  if (!userId) {
    response.status(401).json({
      success: false,
      message: "Authentication required."
    });
    return;
  }

  if (
  typeof transactionId !== "string" ||
  !Types.ObjectId.isValid(transactionId)
) {
  response.status(400).json({
    success: false,
    message: "Invalid transaction ID."
  });
  return;
}
  try {
    const transaction = await TransactionModel.findOne({
      _id: transactionId,
      userId
    });

    if (!transaction) {
      response.status(404).json({
        success: false,
        message: "Transaction not found."
      });
      return;
    }

    response.status(200).json({
      success: true,
      transaction
    });
  } catch (error) {
    console.error("Get transaction error:", error);

    response.status(500).json({
      success: false,
      message: "An internal server error occurred."
    });
  }
};

/**
 * Update a transaction belonging to the authenticated user.
 * PUT /api/transactions/:id
 */
export const updateTransaction: RequestHandler = async (
  request,
  response
) => {
  const userId = getAuthenticatedUserId(request);
  const transactionId = request.params.id;

  if (!userId) {
    response.status(401).json({
      success: false,
      message: "Authentication required."
    });
    return;
  }

 if (
  typeof transactionId !== "string" ||
  !Types.ObjectId.isValid(transactionId)
) {
  response.status(400).json({
    success: false,
    message: "Invalid transaction ID."
  });
  return;
}

  const body: unknown = request.body;

  if (!isRecord(body)) {
    response.status(400).json({
      success: false,
      message: "Invalid request body."
    });
    return;
  }

  const allowedFields = [
    "type",
    "amount",
    "date",
    "category",
    "note"
  ];

  const unknownFields = Object.keys(body).filter(
    (key) => !allowedFields.includes(key)
  );

  if (unknownFields.length > 0) {
    response.status(400).json({
      success: false,
      message: "Request contains unsupported fields.",
      fields: unknownFields
    });
    return;
  }

  const updates: TransactionUpdates = {};

  if ("type" in body) {
    if (!isTransactionType(body.type)) {
      response.status(400).json({
        success: false,
        message: "Type must be income or expense."
      });
      return;
    }

    updates.type = body.type;
  }

  if ("amount" in body) {
    if (!isValidAmount(body.amount)) {
      response.status(400).json({
        success: false,
        message: "Amount must be positive and have at most two decimal places."
      });
      return;
    }

    updates.amount = body.amount;
  }

  if ("date" in body) {
    const transactionDate = parseTransactionDate(body.date);

    if (!transactionDate) {
      response.status(400).json({
        success: false,
        message: "Please provide a valid transaction date."
      });
      return;
    }

    updates.date = transactionDate;
  }

  if ("category" in body) {
    if (
      typeof body.category !== "string" ||
      body.category.trim().length < 2 ||
      body.category.trim().length > 50
    ) {
      response.status(400).json({
        success: false,
        message: "Category must contain between 2 and 50 characters."
      });
      return;
    }

    updates.category = body.category.trim();
  }

  if ("note" in body) {
    if (
      typeof body.note !== "string" ||
      body.note.trim().length > 500
    ) {
      response.status(400).json({
        success: false,
        message: "Note cannot exceed 500 characters."
      });
      return;
    }

    updates.note = body.note.trim();
  }

  if (Object.keys(updates).length === 0) {
    response.status(400).json({
      success: false,
      message: "Provide at least one field to update."
    });
    return;
  }

  try {
    const transaction = await TransactionModel.findOneAndUpdate(
      {
        _id: transactionId,
        userId
      },
      updates,
      {
        new: true,
        runValidators: true
      }
    );

    if (!transaction) {
      response.status(404).json({
        success: false,
        message: "Transaction not found."
      });
      return;
    }

    response.status(200).json({
      success: true,
      message: "Transaction updated successfully.",
      transaction
    });
  } catch (error) {
    console.error("Update transaction error:", error);

    response.status(500).json({
      success: false,
      message: "An internal server error occurred."
    });
  }
};

/**
 * Delete a transaction belonging to the authenticated user.
 * DELETE /api/transactions/:id
 */
export const deleteTransaction: RequestHandler = async (
  request,
  response
) => {
  const userId = getAuthenticatedUserId(request);
  const transactionId = request.params.id;

  if (!userId) {
    response.status(401).json({
      success: false,
      message: "Authentication required."
    });
    return;
  }

  if (
  typeof transactionId !== "string" ||
  !Types.ObjectId.isValid(transactionId)
) {
  response.status(400).json({
    success: false,
    message: "Invalid transaction ID."
  });
  return;
}

  try {
    const result = await TransactionModel.deleteOne({
      _id: transactionId,
      userId
    });

    if (result.deletedCount === 0) {
      response.status(404).json({
        success: false,
        message: "Transaction not found."
      });
      return;
    }

    response.status(200).json({
      success: true,
      message: "Transaction deleted successfully."
    });
  } catch (error) {
    console.error("Delete transaction error:", error);

    response.status(500).json({
      success: false,
      message: "An internal server error occurred."
    });
  }
};
