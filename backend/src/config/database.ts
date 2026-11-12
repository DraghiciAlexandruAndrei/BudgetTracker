
import mongoose from "mongoose";

export async function connectDatabase(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error(
      "MONGODB_URI is not defined. Check the backend/.env file."
    );
  }

  await mongoose.connect(mongoUri);

  console.log(
    `MongoDB connected successfully: ${mongoose.connection.name}`
  );
}
