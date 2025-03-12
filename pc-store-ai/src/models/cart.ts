import { Schema, model, models, Document, Types } from "mongoose";

export interface ICartItem {
  productId: Types.ObjectId;
  quantity: number;
  _id: Types.ObjectId;
}

export interface ICart extends Document {
  userId: Types.ObjectId;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema({
  productId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Product',
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true,
    min: 1 
  }
});

const CartSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    items: [CartItemSchema]
  },
  { timestamps: true }
);

export const Cart = models.Cart || model<ICart>("Cart", CartSchema);
