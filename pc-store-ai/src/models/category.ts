import { Schema, model, models } from "mongoose";

const CategorySchema = new Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  subcategories: [{ type: Schema.Types.ObjectId, ref: "Subcategory" }]
});

export const Category = models.Category || model("Category", CategorySchema);
