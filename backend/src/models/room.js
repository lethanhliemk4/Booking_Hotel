import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  amenities: [{ type: String }],
  images: [{ type: String }],
  hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true }, // Add this field
}, { timestamps: true });

export const Room = mongoose.model('Room', roomSchema);