import { Schema, model, models } from "mongoose";

const SubcategorySchema = new Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
});

export const Subcategory = models.Subcategory || model("Subcategory", SubcategorySchema);
