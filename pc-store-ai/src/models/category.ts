import mongoose, { Schema, model, models } from "mongoose";

const CategorySchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  subcategories: [{ type: Schema.Types.ObjectId, ref: "Category" }] // Każda podkategoria to osobny dokument
});

export const Category = models.Category || model("Category", CategorySchema);
