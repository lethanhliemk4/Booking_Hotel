import mongoose from 'mongoose';

const RoomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  price: { type: Number, required: true },
  capacity: { type: Number, required: true },
  image: { type: String }, // Store the image file path
}, { timestamps: true });

const Room = mongoose.model('Room', RoomSchema);

export const roomRepository = {
  findAll: async () => {
    return await Room.find();
  },

  findById: async (id) => {
    return await Room.findById(id); // Add this method
  },

  create: async (data) => {
    const room = new Room(data);
    return await room.save();
  },

  update: async (id, data) => {
    return await Room.findByIdAndUpdate(id, data, { new: true });
  },

  delete: async (id) => {
    return await Room.findByIdAndDelete(id);
  },
};