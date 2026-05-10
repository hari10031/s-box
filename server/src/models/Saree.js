import mongoose from 'mongoose';

const sareeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    price: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    images: { type: [String], default: [] },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    tags: { type: [String], default: [] },
    stockStatus: { type: String, enum: ['available', 'sold'], default: 'available' },
    adminRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

const Saree = mongoose.model('Saree', sareeSchema);
export default Saree;
