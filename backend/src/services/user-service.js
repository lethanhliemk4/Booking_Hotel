import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/user-repository.js';

export const userService = {
  register: async ({ email, password, name }) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userRepository.create({ email, password: hashedPassword, name });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return { user, token };
  },

  login: async ({ email, password }) => {
    const user = await userRepository.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error('Invalid credentials');
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return { user, token };
  },

  getAllUsers: async (adminUser) => {
    if (adminUser.role !== 'admin') throw new Error('Unauthorized');
    return await userRepository.findAll();
  },

  updateUser: async (id, data, adminUser) => {
    if (adminUser.role !== 'admin') throw new Error('Unauthorized');
    if (data.password) data.password = await bcrypt.hash(data.password, 10);
    return await userRepository.update(id, data);
  },

  deleteUser: async (id, adminUser) => {
    if (adminUser.role !== 'admin') throw new Error('Unauthorized');
    return await userRepository.delete(id);
  },
};