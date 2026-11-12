// nu salvam niciodata parolele in format text
// utilizam bcrypt pentru hash
// in baza de date se va păstra doar hash-ul parolei
import {
  Schema, //schema pt utilizator
  model,
  type InferSchemaType
} from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"], // camp obligatoriu
      trim: true,
      minlength: 2,
      maxlength: 80
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, // nu pot exista 2 utilizatori cu acelasi email
      lowercase: true, // convertim email-ul in litere mici
      trim: true,
      maxlength: 254,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // regex pentru validarea email-ului
    },

    passwordHash: {
      type: String,
      required: true,
      select: false // nu returnam hash-ul parolei la interogarea utilizatorului
    },

    currency: {
      type: String,
      enum: ["RON", "EUR", "USD"],
      default: "RON"
    }
  },
  {
    timestamps: true, // adauga campurile createdAt si updatedAt
    versionKey: false // dezactivam campul __v
  }
);
// exportam tipul User pentru a fi folosit in alte fisiere
export type User = InferSchemaType<typeof userSchema>;
// creaza modelul User pe baza schemei userSchema
export const UserModel = model("User", userSchema);
