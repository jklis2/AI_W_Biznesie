import mongoose, { Schema, model, models } from "mongoose";

const CategorySchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  subcategories: [
    {
      name: { type: String, required: true },
      slug: { type: String, required: true, unique: true }
    }
  ]
});

export const Category = models.Category || model("Category", CategorySchema);
