import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  addressId: { type: String, required: true },
  shippingMethod: { type: String, required: true },
  paymentId: { type: String, required: true },
  status: { type: String, required: true, enum: ['PENDING', 'PAID', 'FAILED'] },
  totalAmount: { type: Number, required: true },
  items: [orderItemSchema],
  createdAt: { type: Date, default: Date.now },
});

export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
