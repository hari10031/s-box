import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    fabric: { type: String, trim: true, default: '' },
    occasion: { type: String, trim: true, default: '' },
    region: { type: String, trim: true, default: '' },
    priceTier: { type: String, enum: ['budget', 'mid', 'premium', 'luxury', ''], default: '' },
  },
  { timestamps: true }
);

const Category = mongoose.model('Category', categorySchema);
export default Category;
