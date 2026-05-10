import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema(
  {
    sareeRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Saree', required: true },
    employeeRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customerRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    adminRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    salePrice: { type: Number, required: true, min: 0 },
    saleDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    rejectionReason: { type: String, trim: true, default: '' },
    note: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

const Sale = mongoose.model('Sale', saleSchema);
export default Sale;
