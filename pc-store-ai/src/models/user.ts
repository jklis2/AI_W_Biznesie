import { Schema, model, models, Document } from "mongoose";

interface Address {
  _id: string;
  street: string;
  houseNumber: string;
  city: string;
  postalCode: string;
  country: string;
}

interface UserDocument extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  addresses: Address[];
  role: "user" | "admin";
}

const AddressSchema = new Schema({
  _id: { type: String, required: true },
  street: { type: String, required: true },
  houseNumber: { type: String, required: true },
  city: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
});

const UserSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    addresses: { type: [AddressSchema], default: [] },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

// Transform the document when converting to JSON
UserSchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    return ret;
  }
});

export const User = models.User || model<UserDocument>("User", UserSchema);
