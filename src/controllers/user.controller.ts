import { Request, Response } from 'express';
import prisma from '../prisma/client';
import { hashPassword } from '../utils/hash';

// GET /api/users - Admin only - List all users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { name, email, address, role } = req.query;

    const users = await prisma.user.findMany({
      where: {
        name: name ? { contains: String(name), mode: 'insensitive' } : undefined,
        email: email ? { contains: String(email), mode: 'insensitive' } : undefined,
        address: address ? { contains: String(address), mode: 'insensitive' } : undefined,
        role: role ? String(role) : undefined,
      },
      select: {
        user_id: true, // changed from `id`
        name: true,
        email: true,
        address: true,
        role: true,
        ratings: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};


// PUT /api/users/password - Update password (logged-in user)
export const updatePassword = async (req: Request, res: Response) => {
  try {
    const { newPassword, userId } = req.body;

    if (!newPassword) return res.status(400).json({ error: 'New password is required' });
    const hashed = await hashPassword(newPassword);
    await prisma.user.update({
      where: { user_id: userId },
      data: {
        password: hashed, // 🔒 You should hash this in production
      },
    });

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update password' });
  }
};

// GET /api/users/:id - Admin only - Get user details (including rating if store owner)
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        store: true,
        ratings: true,
      },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};
export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;  // The user ID from the request parameters
  const { name, email, address, role, password } = req.body;  // Data to update

  try {
    // Find the existing user by ID
    const existingUser = await prisma.user.findUnique({
      where: { user_id: id },
    });

    // If user doesn't exist, return 404
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Hash the new password if it's provided
    const hashedPassword = password ? await hashPassword(password) : existingUser.password;

    // Update the user with the provided data
    const updatedUser = await prisma.user.update({
      where: { user_id: id },
      data: {
        name: name || existingUser.name,
        email: email || existingUser.email,
        address: address || existingUser.address,
        role: role || existingUser.role,
        password: hashedPassword,  // If no new password is provided, it retains the old password
      },
    });

    res.json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating user" });
  }
};