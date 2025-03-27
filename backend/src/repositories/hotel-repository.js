import mongoose from 'mongoose';

const HotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String },
  image: { type: String },
  pricePerNight: { type: Number }, // Add price field
  bathrooms: { type: Number }, // Add bathrooms field
  beds: { type: String }, // Add beds field (e.g., "2 Queen Beds", "1 King Bed")
}, { timestamps: true });

const Hotel = mongoose.model('Hotel', HotelSchema);

export const hotelRepository = {
  findAll: async (query = {}) => {
    return await Hotel.find(query).lean();
  },
  findById: async (id) => {
    return await Hotel.findById(id).lean();
  },
  create: async (data) => {
    const hotel = new Hotel(data);
    return await hotel.save();
  },
  update: async (id, data) => {
    return await Hotel.findByIdAndUpdate(id, data, { new: true }).lean();
  },
  delete: async (id) => {
    return await Hotel.findByIdAndDelete(id);
  },
};