import { Schema, model, models, Document, Types } from "mongoose";

interface Address {
  _id?: Types.ObjectId;
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

interface AddressJSON {
  _id: string;
  street: string;
  houseNumber: string;
  city: string;
  postalCode: string;
  country: string;
}

const AddressSchema = new Schema({
  street: { type: String, required: true },
  houseNumber: { type: String, required: true },
  city: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true }
});

const UserSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    addresses: [AddressSchema],
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

UserSchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    if (ret.addresses) {
      ret.addresses = ret.addresses.map((addr: Address): AddressJSON => ({
        street: addr.street,
        houseNumber: addr.houseNumber,
        city: addr.city,
        postalCode: addr.postalCode,
        country: addr.country,
        _id: addr._id?.toString() || new Types.ObjectId().toString()
      }));
    }
    return ret;
  }
});

export const User = models.User || model<UserDocument>("User", UserSchema);
