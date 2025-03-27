import mongoose from 'mongoose';

const hotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String },
  amenities: [{ type: String }],
  stars: { type: Number, min: 1, max: 5 },
  images: [{ type: String }],
}, { timestamps: true });

export const Hotel = mongoose.model('Hotel', hotelSchema);