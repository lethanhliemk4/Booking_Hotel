import { userService } from '../services/user-service.js';

/**
 * @description Register a new user
 * @route POST /api/auth/register
 */
export const register = async (req, res) => {
  try {
    const { user, token } = await userService.register(req.body);
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @description Login a user
 * @route POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { user, token } = await userService.login(req.body);
    res.status(200).json({ user, token });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};