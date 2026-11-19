// Transaction model definition using Mongoose
import {
  Schema,
  model,
  type InferSchemaType
} from "mongoose";

const transactionSchema = new Schema(
  {
    // User who owns this transaction
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"]
    },

    // Transaction type
    type: {
      type: String,
      enum: {
        values: ["income", "expense"],
        message: "Transaction type must be income or expense"
      },
      required: [true, "Transaction type is required"]
    },

    // Transaction amount
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than zero"],
      validate: {
        validator: (value: number) =>
          Number.isFinite(value),
        message: "Amount must be a valid number"
      }
    },

    // Transaction date
    date: {
      type: Date,
      required: [true, "Transaction date is required"]
    },

    // Transaction category
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      minlength: [2, "Category must contain at least 2 characters"],
      maxlength: [50, "Category cannot exceed 50 characters"]
    },

    // Optional transaction note
    note: {
      type: String,
      trim: true,
      maxlength: [500, "Note cannot exceed 500 characters"],
      default: ""
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Indexes for efficient user-specific queries
transactionSchema.index({
  userId: 1,
  date: -1
});

transactionSchema.index({
  userId: 1,
  type: 1,
  date: -1
});

// Infer TypeScript type from the Mongoose schema
export type Transaction =
  InferSchemaType<typeof transactionSchema>;

export const TransactionModel = model(
  "Transaction",
  transactionSchema
);
