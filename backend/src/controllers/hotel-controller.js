import { hotelRepository } from '../repositories/hotel-repository.js';

export const hotelController = {
  getAllHotels: async (req, res) => {
    try {
      const hotels = await hotelRepository.findAll();
      res.json(hotels);
    } catch (error) {
      console.error('Error in getAllHotels:', error);
      res.status(500).json({ message: 'Failed to fetch hotels', error: error.message });
    }
  },

  addHotel: async (req, res) => {
    const { name, location } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null; // Store image path if uploaded
    try {
      const hotel = await hotelRepository.create({ name, location, image });
      res.status(201).json(hotel);
    } catch (error) {
      console.error('Error in addHotel:', error);
      res.status(500).json({ message: 'Failed to add hotel', error: error.message });
    }
  },

  updateHotel: async (req, res) => {
    const { id } = req.params;
    const { name, location } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : undefined; // Update image if provided
    try {
      const updateData = { name, location };
      if (image !== undefined) updateData.image = image; // Only update image if a new one is uploaded
      const hotel = await hotelRepository.update(id, updateData);
      if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
      res.json(hotel);
    } catch (error) {
      console.error('Error in updateHotel:', error);
      res.status(500).json({ message: 'Failed to update hotel', error: error.message });
    }
  },

  deleteHotel: async (req, res) => {
    const { id } = req.params;
    try {
      const hotel = await hotelRepository.delete(id);
      if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
      res.json({ message: 'Hotel deleted successfully' });
    } catch (error) {
      console.error('Error in deleteHotel:', error);
      res.status(500).json({ message: 'Failed to delete hotel', error: error.message });
    }
  },

  searchHotels: async (req, res) => {
    const { location } = req.query;
    try {
      console.log('Searching hotels with location:', location);
      const query = location ? { location: { $regex: location, $options: 'i' } } : {};
      const hotels = await hotelRepository.findAll(query);
      console.log('Hotels returned:', hotels); // Log dữ liệu trả về
      res.json(hotels);
    } catch (error) {
      console.error('Error in searchHotels:', error);
      res.status(500).json({ message: 'Failed to search hotels', error: error.message });
    }
  },
};