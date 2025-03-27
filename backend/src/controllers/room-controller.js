import { roomRepository } from '../repositories/room-repository.js';
import { roomService } from '../services/room-service.js'; // Add this import

export const roomController = {
  getAllRooms: async (req, res) => {
    try {
      console.log('Fetching all rooms');
      const rooms = await roomRepository.findAll();
      console.log('Rooms fetched:', rooms);
      res.json(rooms);
    } catch (error) {
      console.error('Error in getAllRooms:', error);
      res.status(500).json({ message: 'Failed to fetch rooms', error: error.message });
    }
  },

  addRoom: async (req, res) => {
    const { name, hotelId, price, capacity } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    try {
      const room = await roomRepository.create({ name, hotelId, price, capacity, image });
      res.status(201).json(room);
    } catch (error) {
      console.error('Error in addRoom:', error);
      res.status(500).json({ message: 'Failed to add room', error: error.message });
    }
  },

  updateRoom: async (req, res) => {
    const { id } = req.params;
    const { name, hotelId, price, capacity } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : undefined;
    try {
      const updateData = { name, hotelId, price, capacity };
      if (image) updateData.image = image;
      const room = await roomRepository.update(id, updateData);
      if (!room) return res.status(404).json({ message: 'Room not found' });
      res.json(room);
    } catch (error) {
      console.error('Error in updateRoom:', error);
      res.status(500).json({ message: 'Failed to update room', error: error.message });
    }
  },

  deleteRoom: async (req, res) => {
    const { id } = req.params;
    try {
      const room = await roomRepository.delete(id);
      if (!room) return res.status(404).json({ message: 'Room not found' });
      res.json({ message: 'Room deleted successfully' });
    } catch (error) {
      console.error('Error in deleteRoom:', error);
      res.status(500).json({ message: 'Failed to delete room', error: error.message });
    }
  },

  getRoomsByHotel: async (req, res) => { // Add this method
    try {
      const { hotelId } = req.params;
      console.log(`Fetching rooms for hotelId: ${hotelId}`);
      const rooms = await roomService.getRoomsByHotel(hotelId);
      console.log('Rooms fetched for hotel:', rooms);
      res.json(rooms);
    } catch (error) {
      console.error('Error in getRoomsByHotel:', error);
      res.status(500).json({ message: 'Failed to fetch rooms for hotel', error: error.message });
    }
  },
};