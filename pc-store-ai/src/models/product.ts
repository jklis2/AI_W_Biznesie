import { Schema, model, models, Document } from "mongoose";

export interface ProductSpecifications {
  [key: string]: string | number | boolean;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  category: Schema.Types.ObjectId;
  subcategory?: Schema.Types.ObjectId;
  brand: string;
  price: number;
  stock: number;
  images: string[];
  specifications: ProductSpecifications;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    subcategory: { type: Schema.Types.ObjectId, ref: "Subcategory", required: false },
    brand: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    images: [{ type: String, required: true }],
    specifications: { type: Map, of: Schema.Types.Mixed, required: true },
  },
  { 
    timestamps: true,
    toJSON: {
      transform: function(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

export const Product = models.Product || model<IProduct>("Product", ProductSchema);
