
import { Router } from "express";

import { authenticate } from "../middleware/authMiddleware.js";

import {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction
} from "../controllers/transactionController.js";

const router = Router();

// All transaction endpoints require authentication.
router.use(authenticate);

// Create a transaction
router.post("/", createTransaction);

// Get all transactions of the authenticated user
router.get("/", getTransactions);

// Get one transaction
router.get("/:id", getTransactionById);

// Update a transaction
router.put("/:id", updateTransaction);

// Delete a transaction
router.delete("/:id", deleteTransaction);

export default router;
